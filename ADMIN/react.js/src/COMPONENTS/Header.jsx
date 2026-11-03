function Header() {
const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");


window.location.href = "/";


};

return ( <header className="flex min-h-[68px] items-center justify-between bg-brand-dark px-5 py-3 text-white shadow-sm sm:px-6"> <div className="min-w-0"> <h2 className="truncate font-display text-base font-bold sm:text-lg">
MBBS Counselling Administration </h2>


    <p className="mt-0.5 text-xs text-white/65 sm:text-sm">
      Medical admission & counselling management
    </p>
  </div>

  
</header>

);
}

export default Header;

