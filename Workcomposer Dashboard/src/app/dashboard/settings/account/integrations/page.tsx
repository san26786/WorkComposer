"use client";

import Image from "next/image";
import IntegrationCard from "@/components/settings/IntegrationCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionalDesktop } from "@/context/DesktopContext";
import axios from "axios";
import SettingsLoading from "@/components/settings/SettingsLoading";
import toast from "react-hot-toast";

export default function IntegrationsPage() {
  const router = useRouter();
  const desktop = useOptionalDesktop();

  const [loading, setLoading] = useState(true);

  const [connections, setConnections] = useState({
    jira: false,
    asana: false,
    slack: false,
    keka: false,
    bamboohr: false,
    storage: false,
  });

  useEffect(() => {
    fetchIntegrationStatuses();
  }, []);

  const fetchIntegrationStatuses = async () => {
    try {
      const { data } = await axios.get("/api/integrations/status-summary", {
        withCredentials: true,
      });

      setConnections(data);
    } catch (err: any) {
      console.error("INTEGRATION STATUS ERROR:", err);

      toast.error(
        err.response?.data?.message ||
        "Failed to load integration statuses."
      );
    } finally {
      setLoading(false);
    }
  };


  const openIntegration = (path: string) => {
    if (desktop) {
      const setting = path.split("/").filter(Boolean).pop();

      if (setting) {
        desktop.setActiveSetting(setting);
      }

      return;
    }

    router.push(path);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SettingsLoading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Integrations
        </h1>

        <p className="mt-2 text-gray-600">
          Connect your favorite tools and manage all integrations in one place.
        </p>
      </div>

      {/* Project Management */}
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Project Management
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <IntegrationCard
          icon={
            <Image
              src="/icons/jira.png"
              alt="Jira"
              width={40}
              height={40}
            />
          }
          title="Jira"
          description="Sync tasks and track time across platforms"
          connected={connections.jira}
          onClick={() =>
            openIntegration(
              "/dashboard/settings/account/integrations/jira"
            )
          }
        />

        <IntegrationCard
          icon={
            <Image
              src="/icons/asana.png"
              alt="Asana"
              width={40}
              height={40}
            />
          }
          title="Asana"
          description="Sync tasks and track time across platforms"
          connected={connections.asana}
          onClick={() =>
            openIntegration(
              "/dashboard/settings/account/integrations/asana"
            )
          }
        />
      </div>

      {/* Communication */}
      <div className="mt-10">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Communication
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <IntegrationCard
            icon={
              <Image
                src="/icons/slack.png"
                alt="Slack"
                width={40}
                height={40}
              />
            }
            title="Slack"
            description="Get work reports and notifications in Slack"
            connected={connections.slack}
            onClick={() =>
              openIntegration(
                "/dashboard/settings/account/integrations/slack"
              )
            }
          />
        </div>
      </div>

      {/* HR & Payroll */}
      <div className="mt-10">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          HR & Payroll
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <IntegrationCard
            icon={
              <Image
                src="/icons/keka.png"
                alt="Keka HR"
                width={40}
                height={40}
              />
            }
            title="Keka HR"
            description="Sync attendance and employee information with Keka HR."
            connected={connections.keka}
            onClick={() =>
              openIntegration(
                "/dashboard/settings/account/integrations/keka"
              )
            }
          />

          <IntegrationCard
            icon={
              <Image
                src="/icons/bamboohr.png"
                alt="BambooHR"
                width={40}
                height={40}
              />
            }
            title="BambooHR"
            description="Sync employee directory and leave information."
            connected={connections.bamboohr}
            onClick={() =>
              openIntegration(
                "/dashboard/settings/account/integrations/bamboohr"
              )
            }
          />
        </div>
      </div>

      {/* Storage */}
      <div className="mt-10">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Storage
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <IntegrationCard
            icon={
              <Image
                src="/icons/storage.png"
                alt="External Storage"
                width={40}
                height={40}
              />
            }
            title="External Storage"
            description="Save screenshots and files to your own cloud storage."
            connected={connections.storage}
            onClick={() =>
              openIntegration(
                "/dashboard/settings/account/integrations/storage"
              )
            }
          />
        </div>
      </div>
    </div>
  );
}