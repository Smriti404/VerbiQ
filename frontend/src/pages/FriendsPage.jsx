import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, UsersIcon } from "lucide-react";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const [query, setQuery] = useState("");

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const filteredFriends = useMemo(() => {
    if (!query.trim()) return friends;
    const q = query.toLowerCase();
    return friends.filter((friend) => {
      return (
        friend.fullName?.toLowerCase().includes(q) ||
        friend.nativeLanguage?.toLowerCase().includes(q) ||
        friend.learningLanguage?.toLowerCase().includes(q)
      );
    });
  }, [friends, query]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <UsersIcon className="size-6 text-primary" /> Your Friends
            </h1>
            <p className="text-sm opacity-70">Search and chat with your language partners.</p>
          </div>
          <div className="form-control w-full sm:max-w-sm">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 opacity-60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input input-bordered w-full pl-9"
                placeholder="Search by name or language"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
