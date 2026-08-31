"use client"

import { useState, useEffect } from 'react';
import API from "@/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { X, Check, Plus, Eye, EyeOff } from 'lucide-react';
import { TbSelector } from "react-icons/tb";
import { HiMiniDocumentDuplicate } from "react-icons/hi2";
import BulkInvites from './BulkInvites';
import { HiMiniMinusCircle } from "react-icons/hi2";

type userData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  team: string;
}

type AddUsersProps = {
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  onUserAdded: () => Promise<void>;
};

const AddUsers = ({
  setShowAddModal,
  setUsers,
  onUserAdded,
}: AddUsersProps) => {
  const [loading, setLoading] = useState(false);
  const [usersData, setUsersData] = useState<userData[]>([
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "User",
      team: "",
    }
  ]);

  const [sendInvite, setSendInvite] = useState(true);
  const [teamOpen, setTeamOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const addUserRow = () => {
    setUsersData((prev) => [
      ...prev,
      {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "User",
        team: "",
      },
    ]);
  };

  const removeUserRow = (index: number) => {
    setUsersData((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const updateUserField = (
    index: number,
    field: keyof userData,
    value: string
  ) => {
    setUsersData((prev) =>
      prev.map((user, i) =>
        i === index
          ? { ...user, [field]: value }
          : user
      )
    )
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    // -----------------------------
    // 1. Validate emails
    // -----------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const user of usersData) {
      const email = user.email.trim().toLowerCase();

      if (!email) {
        toast.error("Email is required");
        return;
      }

      if (!emailRegex.test(email)) {
        toast.error(`Invalid email: ${user.email}`);
        return;
      }
    }

    // -----------------------------
    // 2. Check duplicate emails
    //    inside this modal
    // -----------------------------
    const emails = usersData.map((user) =>
      user.email.trim().toLowerCase()
    );

    const duplicateEmails = emails.filter(
      (email, index) =>
        emails.indexOf(email) !== index
    );

    if (duplicateEmails.length > 0) {
      toast.error(
        `Duplicate email: ${duplicateEmails[0]}`
      );
      return;
    }

    // -----------------------------
    // 3. Validate team
    // -----------------------------
    const missingTeam = usersData.find(
      (user) => !user.team
    );

    if (missingTeam) {
      toast.error(
        `Please select a team for ${missingTeam.email}`
      );
      return;
    }

    // -----------------------------
    // 4. Validate passwords
    // -----------------------------
    if (!sendInvite) {
      const missingPassword = usersData.find(
        (user) => !user.password
      );

      if (missingPassword) {
        toast.error(
          `Password is required for ${missingPassword.email}`
        );
        return;
      }
    }

    try {
      setLoading(true);



      // -----------------------------
      // 5. Create / invite users
      // -----------------------------
      for (const user of usersData) {
        const email = user.email.trim().toLowerCase();

        if (sendInvite) {
          await API.post("/users/invite", {
            email,
            role: user.role.toLowerCase(),
            team: user.team,
          });
        } else {
          await API.post("/users/create-user", {
            firstName: user.firstName.trim(),
            lastName: user.lastName.trim(),
            email,
            password: user.password,
            role: user.role.toLowerCase(),
            team: user.team,

          });
        }
      }

      // -----------------------------
      // 6. Refresh users in parent
      //    WITHOUT browser refresh
      // -----------------------------
      await onUserAdded();

      // -----------------------------
      // 7. Success toast
      // -----------------------------
      toast.success(
        sendInvite
          ? usersData.length === 1
            ? "Invitation sent successfully"
            : "Invitations sent successfully"
          : usersData.length === 1
            ? "User added successfully"
            : "Users added successfully"
      );

      // -----------------------------
      // 8. Reset form
      // -----------------------------
      setUsersData([
        {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "User",
          team: "",
        },
      ]);

      // -----------------------------
      // 9. Close modal
      // -----------------------------
      setShowAddModal(false);

    } catch (err: unknown) {
      const error = err as AxiosError<{
        message?: string;
      }>;

      toast.error(
        error.response?.data?.message ||
        (sendInvite
          ? "Failed to send invitation"
          : "Failed to create user")
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown")) {
        setRoleOpen(false);
        setTeamOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {

      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    }
  }, [setShowAddModal])

  const fetchTeams = async () => {
    try {
      const res = await API.get("/teams");
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);



  return (
    <>
      <div role="dialog" className="relative z-50" aria-modal='true'>
        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"></div>
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full w-full max-w-5xl p-8">

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900"> Add users to track their productivity </h2>
                <button onClick={() =>
                  setShowAddModal(false)}
                  type="button" className="text-gray-400 hover:text-gray-500 focus:outline-none" title="Close">
                  <X className='h-6 w-6' />

                </button>
              </div>

              <div className='border-t border-gray-200 my-5'></div>
              <form onSubmit={handleInviteUser}
                className='space-y-4'>


                {usersData.map((user, index) => (
                  <div
                    key={index}
                    className='p-4 rounded-lg bg-gray-50 border border-gray-100 mb-4'
                  >

                    <div className='flex justify-end items-center mb-2'>
                      {usersData.length > 1 && (
                        <button
                          type='button'
                          onClick={() => removeUserRow(index)}
                          className='flex items-center gap-1 text-red-500 text-sm font-medium mt-2 hover:text-red-600'

                        >
                          <HiMiniMinusCircle className='w-5 h-5 mt-0.5' />
                          Remove
                        </button>
                      )}
                    </div>


                    <div
                      className={`grid gap-4 items-end ${sendInvite
                        ? "grid-cols-1 md:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-6"
                        }`}
                    >

                      {/* INVITE USER MODE */}

                      {sendInvite ? (
                        <>
                          {/* EMAIL */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Email
                            </label>

                            <input
                              type='email'
                              value={user.email}
                              onChange={(e) =>
                                updateUserField(index, "email", e.target.value)
                              }
                              placeholder='Email'
                              className='block w-full h-10 rounded-md border-0 px-3 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                            />
                          </div>

                          {/* TEAM */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Team
                            </label>

                            <div className='relative'>
                              <select
                                value={user.team}
                                onChange={(e) =>
                                  updateUserField(index, "team", e.target.value)
                                }
                                className='w-full h-10 appearance-none rounded-md border-0 px-3 pr-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                              >
                                <option value="">Select team</option>

                                {teams.map((team) => (
                                  <option
                                    key={team._id}
                                    value={team._id}
                                  >
                                    {team.name}
                                  </option>
                                ))}
                              </select>

                              <TbSelector className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                            </div>
                          </div>

                          {/* ROLE */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Role
                            </label>

                            <div className='relative'>
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  updateUserField(index, "role", e.target.value)
                                }
                                className='w-full h-10 appearance-none rounded-md border-0 px-3 pr-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                              >
                                <option>User</option>
                                <option>Manager</option>
                                <option>Admin</option>
                              </select>

                              <TbSelector className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* FIRST NAME */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              First Name
                            </label>

                            <input
                              type='text'
                              value={user.firstName}
                              onChange={(e) =>
                                updateUserField(index, "firstName", e.target.value)
                              }
                              placeholder='First Name'
                              className='block w-full h-10 rounded-md border-0 px-3 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                            />
                          </div>

                          {/* LAST NAME */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Last Name
                            </label>

                            <input
                              type='text'
                              value={user.lastName}
                              onChange={(e) =>
                                updateUserField(index, "lastName", e.target.value)
                              }
                              placeholder='Last Name'
                              className='block w-full h-10 rounded-md border-0 px-3 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                            />
                          </div>

                          {/* EMAIL */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Email
                            </label>

                            <input
                              type='email'
                              value={user.email}
                              onChange={(e) =>
                                updateUserField(index, "email", e.target.value)
                              }
                              placeholder='Email'
                              className='block w-full h-10 rounded-md border-0 px-3 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                            />
                          </div>

                          {/* PASSWORD */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Password
                            </label>

                            <div className='relative'>
                              <input
                                type={showPassword ? "text" : "password"}
                                value={user.password}
                                onChange={(e) =>
                                  updateUserField(index, "password", e.target.value)
                                }
                                placeholder='Password'
                                className='block w-full h-10 rounded-md border-0 px-3 pr-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                              />

                              <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                              >
                                {showPassword ? (
                                  <EyeOff className='h-4 w-4' />
                                ) : (
                                  <Eye className='h-4 w-4' />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* TEAM */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Team
                            </label>

                            <div className='relative'>
                              <select
                                value={user.team}
                                onChange={(e) =>
                                  updateUserField(index, "team", e.target.value)
                                }
                                className='w-full h-10 appearance-none rounded-md border-0 px-3 pr-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                              >
                                <option value="">Select team</option>

                                {teams.map((team) => (
                                  <option
                                    key={team._id}
                                    value={team._id}
                                  >
                                    {team.name}
                                  </option>
                                ))}
                              </select>

                              <TbSelector className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                            </div>
                          </div>

                          {/* ROLE */}

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Role
                            </label>

                            <div className='relative'>
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  updateUserField(index, "role", e.target.value)
                                }
                                className='w-full h-10 appearance-none rounded-md border-0 px-3 pr-10 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'
                              >
                                <option>User</option>
                                <option>Manager</option>
                                <option>Admin</option>
                              </select>

                              <TbSelector className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                ))}


                <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative flex items-start'>
                        <div className='flex h-6 items-center'>
                          <input id='send-invite-email' name='send-invite-email' type='checkbox'
                            checked={sendInvite}
                            onChange={(e) =>
                              setSendInvite(e.target.checked)
                            }
                            className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600' />
                        </div>
                        <div className='ml-3 text-sm leading-6'>
                          <label htmlFor='send-invite-email' className='font-medium text-gray-900'>
                            Send invite email to users
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={addUserRow}
                      className='inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                      <Plus className='h-5 w-5 mr-1' />
                      Add Another User
                    </button>
                  </div>
                </div>

                <div className='mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-y-0 gap-4'>
                  <button
                    type='button'
                    onClick={() =>
                      setShowBulkInvite(true)
                    }
                    className='inline-flex items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50'>
                    <HiMiniDocumentDuplicate className='h-5 w-5 mr-2' />
                    Bulk Invite Users
                  </button>

                  <div className='flex flex-col-reverse sm:flex-row gap-3'>
                    <button
                      type='button'
                      onClick={() => setShowAddModal(false)}
                      className='rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'>Cancel</button>
                    <button
                      type='submit'
                      disabled={loading}
                      className={`rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200 ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}`}>{loading ? sendInvite ? "Sending..." : "Creating..." : sendInvite ? "Send Invitations" : "Add Users"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div >
      </div >

      {showBulkInvite && (
        <BulkInvites
          setShowBulkInvite={setShowBulkInvite}
          setUsers={setUsers}
          onUserAdded={onUserAdded}
        />
      )}
    </>
  )
}

export default AddUsers;