import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClockIcon,
  CheckCircleIcon,
  EditIcon,
  LoaderIcon,
  MapPinIcon,
  SaveIcon,
  SparklesIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getUserById, updateMyProfile, uploadProfileAvatar } from "../lib/api";
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_TIMES,
  INTERESTS,
  LANGUAGES,
  PROFICIENCY_LEVELS,
  TIMEZONES,
} from "../constants";
import { capitialize } from "../lib/utils";
import toast from "react-hot-toast";

const emptyProfile = {
  fullName: "",
  bio: "",
  nativeLanguage: "",
  learningLanguage: "",
  proficiency: "",
  interests: [],
  timezone: "",
  availabilityDays: [],
  availabilityTime: "",
  location: "",
  profilePic: "",
};

const getCompletionStats = (isSelf, profile) => {
  if (!isSelf) {
    return { completionPercent: 100, missingTips: [] };
  }

  const checks = [
    { key: "fullName", label: "Add your full name" },
    { key: "bio", label: "Write a short bio" },
    { key: "nativeLanguage", label: "Pick your native language" },
    { key: "learningLanguage", label: "Pick a learning language" },
    { key: "proficiency", label: "Set your proficiency" },
    { key: "timezone", label: "Add your timezone" },
    { key: "location", label: "Add your location" },
    { key: "profilePic", label: "Upload a profile photo" },
  ];

  const total = checks.length + 2;
  let completed = 0;
  const missing = [];

  checks.forEach((item) => {
    if (profile[item.key]) {
      completed += 1;
    } else {
      missing.push(item.label);
    }
  });

  if (profile.interests?.length) {
    completed += 1;
  } else {
    missing.push("Add at least one interest");
  }

  if (profile.availabilityDays?.length && profile.availabilityTime) {
    completed += 1;
  } else {
    missing.push("Set your availability");
  }

  return {
    completionPercent: Math.round((completed / total) * 100),
    missingTips: missing.slice(0, 3),
  };
};

const ProfilePage = () => {
  const { id } = useParams();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const isSelf = !id || id === authUser?._id;

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile", id || authUser?._id],
    queryFn: () => (id ? getUserById(id) : Promise.resolve(authUser)),
    enabled: Boolean(id || authUser),
  });

  const initialProfile = useMemo(() => {
    if (!profileData) return emptyProfile;
    return {
      fullName: profileData.fullName || "",
      bio: profileData.bio || "",
      nativeLanguage: profileData.nativeLanguage || "",
      learningLanguage: profileData.learningLanguage || "",
      proficiency: profileData.proficiency || "",
      interests: profileData.interests || [],
      timezone: profileData.timezone || "",
      availabilityDays: profileData.availabilityDays || [],
      availabilityTime: profileData.availabilityTime || "",
      location: profileData.location || "",
      profilePic: profileData.profilePic || "",
    };
  }, [profileData]);

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState(initialProfile);
  const [localPreview, setLocalPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profileData) {
      setFormState(initialProfile);
    }
  }, [profileData, initialProfile]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile", authUser?._id] });
      if (data?.user) {
        setFormState({
          ...formState,
          ...data.user,
          interests: data.user.interests || [],
          availabilityDays: data.user.availabilityDays || [],
        });
      }
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (data) => {
      toast.success("Profile photo updated");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile", authUser?._id] });
      if (data?.user?.profilePic) {
        setFormState((prev) => ({ ...prev, profilePic: data.user.profilePic }));
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload photo");
    },
  });

  const handleToggle = (key, value) => {
    const current = formState[key] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormState({ ...formState, [key]: next });
  };

  const handleSave = () => {
    saveProfile(formState);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    uploadAvatar(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!id && !authUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Please sign in to view your profile.</p>
        <Link to="/login" className="btn btn-primary mt-4">
          Go to Login
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Profile failed to load.</p>
        <p className="text-sm opacity-70 mt-2">
          {error?.response?.data?.message || "Please try again."}
        </p>
        <button
          className="btn btn-outline mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["profile", id || authUser?._id] })}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="loading loading-spinner loading-lg" />
        <p className="text-sm opacity-70 mt-3">Loading your profile...</p>
      </div>
    );
  }

  const displayProfile = isSelf ? formState : profileData;
  const { completionPercent, missingTips } = getCompletionStats(isSelf, displayProfile);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <SparklesIcon className="size-6 text-primary" />
              {isSelf ? "Your Profile" : `${profileData.fullName}'s Profile`}
            </h1>
            <p className="text-sm opacity-70">Keep your profile sharp for better matches.</p>
          </div>
          {isSelf && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (!isEditing) {
                  setFormState(initialProfile);
                }
                setIsEditing(!isEditing);
              }}
            >
              <EditIcon className="size-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        {isSelf && (
          <div className="card bg-base-200 shadow-md">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Profile completeness</h2>
                  <p className="text-sm opacity-70">Finish your profile to boost matches.</p>
                </div>
                <div className="text-2xl font-bold text-primary">{completionPercent}%</div>
              </div>
              <progress className="progress progress-primary w-full" value={completionPercent} max="100" />
              {missingTips.length > 0 && (
                <div className="text-sm opacity-80">
                  <p className="font-semibold mb-2">Quick tips</p>
                  <div className="flex flex-wrap gap-2">
                    {missingTips.map((tip) => (
                      <span key={tip} className="badge badge-outline">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card bg-base-200 shadow-md">
          <div className="card-body grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="avatar size-28 rounded-full overflow-hidden bg-base-300">
                {localPreview || displayProfile.profilePic ? (
                  <img
                    src={localPreview || displayProfile.profilePic}
                    alt={displayProfile.fullName}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <UserIcon className="size-12 opacity-40" />
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="space-y-2 w-full">
                  <input
                    type="url"
                    className="input input-bordered w-full"
                    placeholder="Profile image URL"
                    value={formState.profilePic}
                    onChange={(e) => setFormState({ ...formState, profilePic: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm w-full"
                    onClick={handleUploadClick}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "Uploading..." : "Upload from device"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                  <p className="text-xs opacity-60">Max 2MB. JPG/PNG recommended.</p>
                </div>
              )}
              {!isEditing && (
                <div className="text-center">
                  <p className="font-semibold text-lg">{displayProfile.fullName}</p>
                  <p className="text-sm opacity-70">
                    {displayProfile.location || "Location not set"}
                  </p>
                </div>
              )}
              {!isEditing && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {displayProfile.nativeLanguage && (
                    <span className="badge badge-secondary">
                      Native: {capitialize(displayProfile.nativeLanguage)}
                    </span>
                  )}
                  {displayProfile.learningLanguage && (
                    <span className="badge badge-outline">
                      Learning: {capitialize(displayProfile.learningLanguage)}
                    </span>
                  )}
                  {displayProfile.proficiency && (
                    <span className="badge badge-primary">
                      {capitialize(displayProfile.proficiency)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={formState.fullName}
                        onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Location</span>
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 opacity-60" />
                        <input
                          type="text"
                          className="input input-bordered w-full pl-9"
                          value={formState.location}
                          onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bio</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      value={formState.bio}
                      onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Native Language</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formState.nativeLanguage}
                        onChange={(e) =>
                          setFormState({ ...formState, nativeLanguage: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Learning Language</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formState.learningLanguage}
                        onChange={(e) =>
                          setFormState({ ...formState, learningLanguage: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Proficiency</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formState.proficiency}
                        onChange={(e) => setFormState({ ...formState, proficiency: e.target.value })}
                      >
                        <option value="">Select</option>
                        {PROFICIENCY_LEVELS.map((level) => (
                          <option key={level} value={level.toLowerCase()}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Timezone</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formState.timezone}
                        onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                      >
                        <option value="">Select</option>
                        {TIMEZONES.map((zone) => (
                          <option key={zone.value} value={zone.value}>
                            {zone.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TagIcon className="size-4 text-primary" /> Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          className={`btn btn-sm ${
                            formState.interests.includes(interest) ? "btn-primary" : "btn-outline"
                          }`}
                          onClick={() => handleToggle("interests", interest)}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <CalendarClockIcon className="size-4 text-primary" /> Availability Days
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABILITY_DAYS.map((day) => (
                          <button
                            key={day}
                            type="button"
                            className={`btn btn-sm ${
                              formState.availabilityDays.includes(day)
                                ? "btn-primary"
                                : "btn-outline"
                            }`}
                            onClick={() => handleToggle("availabilityDays", day)}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Availability Window</span>
                      </label>
                      <select
                        className="select select-bordered"
                        value={formState.availabilityTime}
                        onChange={(e) =>
                          setFormState({ ...formState, availabilityTime: e.target.value })
                        }
                      >
                        <option value="">Select</option>
                        {AVAILABILITY_TIMES.map((slot) => (
                          <option key={slot} value={slot.toLowerCase()}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end">
                    <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
                      {isPending ? (
                        <>
                          <LoaderIcon className="size-4 mr-2 animate-spin" /> Saving
                        </>
                      ) : (
                        <>
                          <SaveIcon className="size-4 mr-2" /> Save changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="size-4 text-primary" />
                      <span>{displayProfile.location || "Location not set"}</span>
                    </div>
                    <p className="text-sm opacity-80">
                      {displayProfile.bio || "No bio yet."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Timezone</p>
                      <p className="opacity-70">{displayProfile.timezone || "Not set"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Availability</p>
                      <p className="opacity-70">
                        {(displayProfile.availabilityDays || []).join(", ") || "Flexible"}
                        {displayProfile.availabilityTime
                          ? ` · ${capitialize(displayProfile.availabilityTime)}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Interests</p>
                    {displayProfile.interests?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.interests.map((interest) => (
                          <span key={interest} className="badge badge-outline">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm opacity-70">No interests added yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/" className="btn btn-ghost">
            Back to Home
          </Link>
          {isSelf && !isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <CheckCircleIcon className="size-4 mr-2" /> Update Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
