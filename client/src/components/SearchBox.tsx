import { FaSearch } from "react-icons/fa";

export function SearchBox() {
  return (
<div className="w-[90%] flex rounded m-3 bg-[#33373D] border border-[#4C9EEB] text-[#F7F7F7]">
  <input
    type="text"
    className="w-full p-3 outline-none text-[#F7F7F7] placeholder:text-[#B1B5C3] bg-transparent"
    placeholder="Search..."
  />
  <button className="p-3 bg-[#4C9EEB] hover:bg-[#3B7DD4] transition-colors duration-200">
    <FaSearch className="text-[#F7F7F7]" />
  </button>
</div>
  );
}
