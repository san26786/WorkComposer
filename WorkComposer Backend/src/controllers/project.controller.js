import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { hasPermission } from "../middleware/permission.middleware.js";

// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
const canManageProjects = await hasPermission(
  req.user,
  "manage_projects"
);

if (!canManageProjects) {
  return res.status(403).json({
    message: "You do not have permission to create projects.",
  });
}

    const { name, teams, users } = req.body;

    const project = await Project.create({
      name,
      teams,
      users,
      organization: req.user.organization,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// GET PROJECTS
export const getProjects = async (req, res) => {
  try {
    const organizationId =
      req.user.organization?._id || req.user.organization;

    const canManageProjects = await hasPermission(
      req.user,
      "manage_projects",
    );

    /*
     * Make sure the Default Project exists.
     */
    let defaultProject = await Project.findOne({
      name: "Default Project",
      organization: organizationId,
    });

    if (!defaultProject) {
      defaultProject = await Project.create({
        name: "Default Project",
        organization: organizationId,
        createdBy: req.user._id,
      });
    }

    /*
     * Move tasks without a project into the
     * organization's Default Project.
     *
     * IMPORTANT:
     * Only update tasks belonging to this organization.
     */
    await Task.updateMany(
      {
        organization: organizationId,
        $or: [
          { project: null },
          { project: { $exists: false } },
        ],
      },
      {
        project: defaultProject._id,
      },
    );

    /*
     * Build the project visibility query.
     *
     * Users with manage_projects can see every
     * project in the organization.
     */
    let query = {
      organization: organizationId,
    };

    if (!canManageProjects) {
      /*
       * Same visibility rule used by getTasks:
       *
       * - User sees their own tasks.
       * - Manager also sees tasks assigned to
       *   users they manage.
       */
      const managedUsers = await User.find(
        {
          organization: organizationId,
          manager: req.user._id,
        },
        "_id",
      );

      const visibleUserIds = [
        req.user._id,
        ...managedUsers.map((user) => user._id),
      ];

      /*
       * Find projects which contain tasks visible
       * to this user.
       */
      const visibleProjectIds = await Task.distinct(
        "project",
        {
          organization: organizationId,
          deleted: false,
          assignedTo: {
            $in: visibleUserIds,
          },
        },
      );

      /*
       * Only show projects that contain at least
       * one task the user is allowed to see.
       */
      query._id = {
        $in: visibleProjectIds.filter(Boolean),
      };
    }

    const projects = await Project.find(query)
      .populate(
        "users",
        "firstName lastName email",
      )
      .sort({ createdAt: -1 });

    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({
          organization: organizationId,
          project: project._id,
          deleted: false,
        });

        return {
          ...project.toObject(),
          taskCount,
        };
      }),
    );

    return res.status(200).json(projectsWithTaskCount);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const canManageProjects = await hasPermission(req.user, "manage_projects");

    if (!canManageProjects) {
      return res.status(403).json({
        message: "You do not have permission to update projects.",
      });
    }
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    res.status(200).json(updatedProject);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const canManageProjects = await hasPermission(req.user, "manage_projects");

    if (!canManageProjects) {
      return res.status(403).json({
        message: "You do not have permission to delete projects.",
      });
    }
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // DON'T DELETE DEFAULT PROJECT
    if (project.name === "Default Project") {
      return res.status(400).json({
        message: "Default Project cannot be deleted",
      });
    }

    // DELETE TASKS OF PROJECT
    await Task.deleteMany({
      project: project._id,
    });

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
