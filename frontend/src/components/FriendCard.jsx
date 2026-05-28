import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { capitialize } from "../lib/utils";

const formatAvailability = (days = [], time = "") => {
  if (!days.length && !time) return "";
  const dayLabel = days.length ? days.join(", ") : "Flexible";
  const timeLabel = time ? capitialize(time) : "Anytime";
  return `${dayLabel} · ${timeLabel}`;
};

const FriendCard = ({ friend }) => {
  return (
    <div className="card verbiq-card">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge verbiq-badge text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {capitialize(friend.nativeLanguage)}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {capitialize(friend.learningLanguage)}
          </span>
          {friend.proficiency && (
            <span className="badge verbiq-badge text-xs">{capitialize(friend.proficiency)}</span>
          )}
        </div>

        {(friend.availabilityDays?.length > 0 || friend.availabilityTime) && (
          <p className="text-xs text-[var(--verbiq-muted)] mb-3">
            Available: {formatAvailability(friend.availabilityDays, friend.availabilityTime)}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Link to={`/profile/${friend._id}`} className="btn verbiq-btn-outline w-full">
            View Profile
          </Link>
          <Link to={`/chat/${friend._id}`} className="btn verbiq-btn w-full">
            Message
          </Link>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
