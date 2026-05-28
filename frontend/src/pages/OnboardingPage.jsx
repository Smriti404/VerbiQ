import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import {
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  LoaderIcon,
  MapPinIcon,
  ShuffleIcon,
} from "lucide-react";
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_TIMES,
  INTERESTS,
  LANGUAGES,
  PROFICIENCY_LEVELS,
  TIMEZONES,
} from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    proficiency: authUser?.proficiency || "",
    interests: authUser?.interests || [],
    timezone: authUser?.timezone || "",
    availabilityDays: authUser?.availabilityDays || [],
    availabilityTime: authUser?.availabilityTime || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const missingFields = [];

    if (!formState.fullName.trim()) missingFields.push("full name");
    if (!formState.bio.trim()) missingFields.push("bio");
    if (!formState.nativeLanguage) missingFields.push("native language");
    if (!formState.learningLanguage) missingFields.push("learning language");
    if (!formState.proficiency) missingFields.push("proficiency");
    if (!formState.timezone) missingFields.push("timezone");
    if (!formState.location.trim()) missingFields.push("location");
    if (formState.interests.length === 0) missingFields.push("interests");
    if (formState.availabilityDays.length === 0) missingFields.push("availability days");
    if (!formState.availabilityTime) missingFields.push("availability time");

    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.join(", ")}`);
      return;
    }

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-[#f7f9ff] to-[#e9f0ff] flex items-center justify-center px-4 py-10">
      <div className="card bg-base-200/90 w-full max-w-4xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <div className="text-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Build your VerbiQ profile</h1>
            <p className="text-sm opacity-70 mt-2">
              Share your goals and availability so we can match you faster.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="badge badge-primary badge-outline">Match-ready</span>
            <span className="badge badge-secondary badge-outline">Timezone-aware</span>
            <span className="badge badge-accent badge-outline">Interest-based</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <p className="text-xs uppercase tracking-wide opacity-60">Profile photo</p>
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* PROFILE PHOTO URL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Profile photo URL (optional)</span>
              </label>
              <input
                type="url"
                name="profilePic"
                value={formState.profilePic}
                onChange={(e) => setFormState({ ...formState, profilePic: e.target.value })}
                className="input input-bordered w-full"
                placeholder="https://..."
              />
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PROFICIENCY + TIMEZONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Proficiency</span>
                </label>
                <select
                  name="proficiency"
                  value={formState.proficiency}
                  onChange={(e) => setFormState({ ...formState, proficiency: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your level</option>
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
                  name="timezone"
                  value={formState.timezone}
                  onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your timezone</option>
                  {TIMEZONES.map((zone) => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* INTERESTS */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Interests</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = formState.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline"}`}
                      onClick={() => {
                        const next = isSelected
                          ? formState.interests.filter((item) => item !== interest)
                          : [...formState.interests, interest];
                        setFormState({ ...formState, interests: next });
                      }}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Availability Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_DAYS.map((day) => {
                    const isSelected = formState.availabilityDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline"}`}
                        onClick={() => {
                          const next = isSelected
                            ? formState.availabilityDays.filter((item) => item !== day)
                            : [...formState.availabilityDays, day];
                          setFormState({ ...formState, availabilityDays: next });
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Availability Window</span>
                </label>
                <div className="relative">
                  <ClockIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                  <select
                    name="availabilityTime"
                    value={formState.availabilityTime}
                    onChange={(e) =>
                      setFormState({ ...formState, availabilityTime: e.target.value })
                    }
                    className="select select-bordered w-full pl-10"
                  >
                    <option value="">Select time window</option>
                    {AVAILABILITY_TIMES.map((slot) => (
                      <option key={slot} value={slot.toLowerCase()}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <CheckCircleIcon className="size-5 mr-2" />
                  Save Profile
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
