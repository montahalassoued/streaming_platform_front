const CATEGORIES = [
  {
    id: "just-chatting",
    name: "Just Chatting",
    watching: "111.9K watching",
    tags: ["IRL", "Casual"],
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "gta-v",
    name: "Grand Theft Auto V",
    watching: "71.2K watching",
    tags: ["Shooter", "Action"],
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "irl",
    name: "IRL",
    watching: "66.6K watching",
    tags: ["IRL", "Adventure"],
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    watching: "40.5K watching",
    tags: ["MOBA", "Action"],
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "counter-strike-2",
    name: "Counter-Strike 2",
    watching: "35.2K watching",
    tags: ["Shooter"],
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "slots-casino",
    name: "Slots & Casino",
    watching: "31.9K watching",
    tags: ["Gambling"],
    image:
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "dota-2",
    name: "Dota 2",
    watching: "19.6K watching",
    tags: ["MOBA", "Action"],
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "fc-26",
    name: "EA Sports FC 26",
    watching: "8.3K watching",
    tags: ["Simulator"],
    image:
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "free-fire",
    name: "Garena Free Fire",
    watching: "8.7K watching",
    tags: ["Mobile Game"],
    image:
      "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "first-light",
    name: "007 First Light",
    watching: "6.3K watching",
    tags: ["Adventure"],
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "arc-raiders",
    name: "ARC Raiders",
    watching: "3.6K watching",
    tags: ["Shooter", "Action"],
    image:
      "https://images.unsplash.com/photo-1546443046-ed1ce6ffd1ab?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "gartic-phone",
    name: "Gartic Phone",
    watching: "8K watching",
    tags: ["Quiz / Trivia"],
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "chat-roulette",
    name: "Chat Roulette",
    watching: "12.3K watching",
    tags: ["Casual"],
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "fortnite",
    name: "Fortnite",
    watching: "5.4K watching",
    tags: ["Shooter"],
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "warzone",
    name: "Call of Duty: Warzone",
    watching: "3.5K watching",
    tags: ["Shooter"],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "world-of-warcraft",
    name: "World of Warcraft",
    watching: "3.5K watching",
    tags: ["RPG"],
    image:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=640&auto=format&fit=crop",
  },
];

export default function BrowsePage() {
  return (
    <div className="p-6 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary text-black px-2 py-0.5 rounded-sm font-black uppercase italic text-lg">
          StreamX
        </div>
        <h1 className="text-xl font-bold text-white">Browse</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="group">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden mb-2">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <div className="text-white font-bold text-sm truncate">{category.name}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-2">{category.watching}</div>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag) => (
                <span
                  key={`${category.id}-${tag}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
