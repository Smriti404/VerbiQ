import { useState } from "react";
import { Link } from "react-router";
import { BellIcon, LogOutIcon, SettingsIcon, ShieldIcon, UserIcon, VideoIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "../components/ThemeSelector";

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation, isPending } = useLogout();
  const [privacySettings, setPrivacySettings] = useState({
    showLocation: true,
    showAvailability: true,
    showInterests: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    friendRequests: true,
    newMessages: true,
    reminders: false,
  });
  const [callSettings, setCallSettings] = useState({
    autoJoinWithVideo: true,
    enableEchoCheck: true,
    lowDataMode: false,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="size-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          <div className="card bg-base-200 shadow-md">
            <div className="card-body items-center text-center gap-4">
              <div className="avatar size-20 rounded-full overflow-hidden bg-base-300">
                {authUser?.profilePic ? (
                  <img src={authUser.profilePic} alt={authUser.fullName} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <UserIcon className="size-8 opacity-40" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{authUser?.fullName}</p>
                <p className="text-xs opacity-70">{authUser?.email}</p>
              </div>
              <Link to="/profile" className="btn btn-outline btn-sm w-full">
                Edit Profile
              </Link>
              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={logoutMutation}
                disabled={isPending}
              >
                <LogOutIcon className="size-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <div>
                  <h2 className="font-semibold text-lg">Appearance</h2>
                  <p className="text-sm opacity-70">Switch themes and make VerbiQ yours.</p>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeSelector />
                  <span className="text-sm opacity-70">Theme selector</span>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Privacy</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "showLocation", label: "Show my location" },
                    { key: "showAvailability", label: "Show my availability" },
                    { key: "showInterests", label: "Show my interests" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={privacySettings[item.key]}
                        onChange={() =>
                          setPrivacySettings({
                            ...privacySettings,
                            [item.key]: !privacySettings[item.key],
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs opacity-60">Saved locally for now.</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <div className="flex items-center gap-2">
                  <BellIcon className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Notifications</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "friendRequests", label: "Friend requests" },
                    { key: "newMessages", label: "New messages" },
                    { key: "reminders", label: "Practice reminders" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={notificationSettings[item.key]}
                        onChange={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: !notificationSettings[item.key],
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs opacity-60">Saved locally for now.</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <div className="flex items-center gap-2">
                  <VideoIcon className="size-5 text-primary" />
                  <h2 className="font-semibold text-lg">Call Preferences</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "autoJoinWithVideo", label: "Join calls with video on" },
                    { key: "enableEchoCheck", label: "Run echo check before calls" },
                    { key: "lowDataMode", label: "Enable low data mode" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={callSettings[item.key]}
                        onChange={() =>
                          setCallSettings({
                            ...callSettings,
                            [item.key]: !callSettings[item.key],
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs opacity-60">Saved locally for now.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
