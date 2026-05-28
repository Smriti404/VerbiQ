import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getFriendRequests,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  CompassIcon,
  ClockIcon,
  FilterIcon,
  MessageCircleIcon,
  MapPinIcon,
  TagIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";
import { AVAILABILITY_DAYS, AVAILABILITY_TIMES, LANGUAGES, TIMEZONES } from "../constants";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const [filters, setFilters] = useState({
    nativeLanguage: "",
    learningLanguage: "",
    timezone: "",
    availabilityTime: "",
    availabilityDays: [],
  });

  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState("");

  useEffect(() => {
    const savedStreak = Number(localStorage.getItem("verbiq-streak") || 0);
    const savedCheckIn = localStorage.getItem("verbiq-last-checkin") || "";
    setStreak(Number.isNaN(savedStreak) ? 0 : savedStreak);
    setLastCheckIn(savedCheckIn);
  }, []);

  const handleDailyCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (lastCheckIn === today) return;

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setLastCheckIn(today);
    localStorage.setItem("verbiq-streak", String(nextStreak));
    localStorage.setItem("verbiq-last-checkin", today);
  };

  const filteredUsers = useMemo(() => {
    return recommendedUsers.filter((user) => {
      if (filters.nativeLanguage && user.nativeLanguage !== filters.nativeLanguage) return false;
      if (filters.learningLanguage && user.learningLanguage !== filters.learningLanguage)
        return false;
      if (filters.timezone && user.timezone !== filters.timezone) return false;
      if (filters.availabilityTime && user.availabilityTime !== filters.availabilityTime)
        return false;
      if (filters.availabilityDays.length > 0) {
        const hasOverlap = filters.availabilityDays.some((day) =>
          user.availabilityDays?.includes(day)
        );
        if (!hasOverlap) return false;
      }
      return true;
    });
  }, [recommendedUsers, filters]);

  return (
    <div className="min-h-screen verbiq-page text-[var(--verbiq-ink)]">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10 verbiq-fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight verbiq-title">
            Your Friends
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/profile" className="btn btn-sm verbiq-btn">
              Edit Profile
            </Link>
            <Link to="/notifications" className="btn btn-sm verbiq-btn-outline">
              <UsersIcon className="mr-2 size-4" />
              Friend Requests
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
          <div className="card verbiq-card">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <CompassIcon className="size-5 text-primary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link to="/friends" className="btn verbiq-btn-outline">
                  <UsersIcon className="size-4 mr-2" /> Friends
                </Link>
                <Link to="/profile" className="btn verbiq-btn-outline">
                  <FilterIcon className="size-4 mr-2" /> Update Profile
                </Link>
                <Link to="/" className="btn verbiq-btn">
                  <MessageCircleIcon className="size-4 mr-2" /> Find Partners
                </Link>
              </div>
            </div>
          </div>

          <div className="card verbiq-card">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <ClockIcon className="size-5 text-primary" />
              </div>
              <div className="space-y-3 text-sm">
                {incomingRequests.length === 0 && acceptedRequests.length === 0 ? (
                  <p className="text-[var(--verbiq-muted)]">No new activity yet.</p>
                ) : (
                  <>
                    {incomingRequests.slice(0, 2).map((req) => (
                      <div key={req._id} className="flex items-center justify-between">
                        <span>{req.sender.fullName} sent a friend request.</span>
                        <Link to="/notifications" className="link link-primary">
                          Review
                        </Link>
                      </div>
                    ))}
                    {acceptedRequests.slice(0, 2).map((req) => (
                      <div key={req._id} className="flex items-center justify-between">
                        <span>{req.recipient.fullName} accepted your request.</span>
                        <Link to={`/profile/${req.recipient._id}`} className="link link-primary">
                          View
                        </Link>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
          <div className="card verbiq-card">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Daily Goal Streak</h3>
                <span className="badge verbiq-badge">{streak} days</span>
              </div>
              <p className="text-sm text-[var(--verbiq-muted)]">
                Check in once a day to keep your momentum going.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn verbiq-btn"
                  onClick={handleDailyCheckIn}
                  disabled={lastCheckIn === new Date().toISOString().slice(0, 10)}
                >
                  {lastCheckIn === new Date().toISOString().slice(0, 10)
                    ? "Checked in today"
                    : "Check in"}
                </button>
                <span className="text-xs text-[var(--verbiq-muted)]">
                  Current streak: {streak} day{streak === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
          <div className="card verbiq-card">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Focus</h3>
                <span className="badge badge-outline">Today</span>
              </div>
              <p className="text-sm text-[var(--verbiq-muted)]">
                Pick one small goal and pair with a partner for 10 minutes.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Pronunciation", "Listening", "Vocabulary"].map((goal) => (
                  <span key={goal} className="badge badge-outline">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
          ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight verbiq-title">
                  Meet New Learners
                </h2>
                <p className="text-[var(--verbiq-muted)]">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="card verbiq-card">
                <div className="card-body space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Discovery Filters</h3>
                    <FilterIcon className="size-5 text-primary" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Native language</span>
                      </label>
                      <select
                        className="select select-bordered bg-white text-slate-900"
                        value={filters.nativeLanguage}
                        onChange={(e) =>
                          setFilters({ ...filters, nativeLanguage: e.target.value })
                        }
                      >
                        <option value="">Any</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Learning language</span>
                      </label>
                      <select
                        className="select select-bordered bg-white text-slate-900"
                        value={filters.learningLanguage}
                        onChange={(e) =>
                          setFilters({ ...filters, learningLanguage: e.target.value })
                        }
                      >
                        <option value="">Any</option>
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Timezone</span>
                      </label>
                      <select
                        className="select select-bordered bg-white text-slate-900"
                        value={filters.timezone}
                        onChange={(e) => setFilters({ ...filters, timezone: e.target.value })}
                      >
                        <option value="">Any</option>
                        {TIMEZONES.map((zone) => (
                          <option key={zone.value} value={zone.value}>
                            {zone.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Availability</span>
                      </label>
                      <select
                        className="select select-bordered bg-white text-slate-900"
                        value={filters.availabilityTime}
                        onChange={(e) =>
                          setFilters({ ...filters, availabilityTime: e.target.value })
                        }
                      >
                        <option value="">Any</option>
                        {AVAILABILITY_TIMES.map((slot) => (
                          <option key={slot} value={slot.toLowerCase()}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-sm ${
                          filters.availabilityDays.includes(day)
                            ? "verbiq-btn"
                            : "verbiq-btn-outline"
                        }`}
                        onClick={() => {
                          const next = filters.availabilityDays.includes(day)
                            ? filters.availabilityDays.filter((item) => item !== day)
                            : [...filters.availabilityDays, day];
                          setFilters({ ...filters, availabilityDays: next });
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="card verbiq-card p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">No matches for these filters</h3>
                  <p className="text-[var(--verbiq-muted)]">Try a different filter mix.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => {
                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                    return (
                      <div
                        key={user._id}
                        className="card verbiq-card"
                      >
                        <div className="card-body p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar size-16 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg">{user.fullName}</h3>
                              {user.location && (
                                <div className="flex items-center text-xs opacity-70 mt-1">
                                  <MapPinIcon className="size-3 mr-1" />
                                  {user.location}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Languages with flags */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="badge verbiq-badge">
                              {getLanguageFlag(user.nativeLanguage)}
                              Native: {capitialize(user.nativeLanguage)}
                            </span>
                            <span className="badge badge-outline">
                              {getLanguageFlag(user.learningLanguage)}
                              Learning: {capitialize(user.learningLanguage)}
                            </span>
                            {user.proficiency && (
                              <span className="badge verbiq-badge">
                                {capitialize(user.proficiency)}
                              </span>
                            )}
                          </div>

                          {user.bio && (
                            <p className="text-sm text-[var(--verbiq-muted)]">{user.bio}</p>
                          )}

                          {(user.availabilityDays?.length > 0 || user.availabilityTime) && (
                            <div className="text-xs text-[var(--verbiq-muted)] flex items-center gap-2">
                              <ClockIcon className="size-3" />
                              <span>
                                {user.availabilityDays?.length
                                  ? user.availabilityDays.join(", ")
                                  : "Flexible"}
                                {user.availabilityTime
                                  ? ` · ${capitialize(user.availabilityTime)}`
                                  : ""}
                              </span>
                            </div>
                          )}

                          {user.timezone && (
                            <div className="text-xs text-[var(--verbiq-muted)]">
                              Timezone: {user.timezone}
                            </div>
                          )}

                          {user.interests?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {user.interests.slice(0, 4).map((interest) => (
                                <span key={interest} className="badge badge-ghost badge-sm">
                                  <TagIcon className="size-3 mr-1" />
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action button */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <Link to={`/profile/${user._id}`} className="btn verbiq-btn-outline">
                              View Profile
                            </Link>
                            <button
                              className={`btn ${
                                hasRequestBeenSent ? "btn-disabled" : "verbiq-btn"
                              }`}
                              onClick={() => sendRequestMutation(user._id)}
                              disabled={hasRequestBeenSent || isPending}
                            >
                              {hasRequestBeenSent ? (
                                <>
                                  <CheckCircleIcon className="size-4 mr-2" />
                                  Request Sent
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="size-4 mr-2" />
                                  Add Friend
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
