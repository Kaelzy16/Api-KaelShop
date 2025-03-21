
    async function loadSettings() {
        let settings = await fetch("/endpoints.json").then(data => data.json())
        let set = await fetch("/settings.json").then(data => data.json())
       
      
      document.querySelector("#pagetitle").textContent = set.pagetitle
      document.querySelector("footer").textContent = `© 2024 ${set.creator}. All rights reserved.`
      document.querySelector("header #webtitle").textContent = set.apititle
       document.getElementById("webtitle").textContent = set.apititle
        document.getElementById("logo").src = set.image
        document.getElementById("profile-pic").src = set.image
        document.getElementById("profile-links").href = set.contact
        document.querySelector("#otherlinks a:nth-child(1)").href = set.contact
        document.querySelector("#otherlinks p a").href = set.links
        
        const menu = document.getElementById("menu");
        let menuHTML = `<a class="block py-2.5 px-4 rounded hover:bg-blue-400 text-slate-700 font-poppins font-semibold text-[18px]" href=${window.location.origin}/><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;

        settings.forEach((item, index) => {
            menuHTML += `
                <div class="relative font-poppins font-semibold">
                    <button class="block py-2.5 px-4 rounded text-slate-700 hover:bg-blue-400 w-full text-left text-[18px]" onclick="toggleDropdown('dropdown-${index}', 'chevron-${index}')">
                        <i class='${item.icon}'></i> ${item.category}
                        <i id="chevron-${index}" class="fas fa-chevron-down float-right"></i>
                    </button>
                    <div id="dropdown-${index}" class="hidden">
                        ${item.api.slice().sort((a, b) => a.name.localeCompare(b.name)).map(api => `<a class="flex items-center gap-1 text-slate-700 py-2.5 px-4 font-[17px] hover:bg-blue-400" href=${window.location.origin}${api.path}><i class="fa-regular fa-circle mr-1 ml-1 font-bold text-[8px]"></i>${api.name}</a>`).join('')}
                    </div>
                </div>`;
        });

        menu.innerHTML = menuHTML;

    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');

    menuBtn.addEventListener('click', (event) => {
        sidebar.classList.toggle('-translate-x-full');
        event.stopPropagation(); // Mencegah event click merambat ke document
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target) && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
        }
    });

    // Dropdown toggle


    document.addEventListener('click', (event) => {
        const isDropdown = event.target.closest('.relative');
        if (!isDropdown) {
            document.querySelectorAll('.relative > div').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.relative > button > i.float-right').forEach(el => {
                el.classList.remove('fa-chevron-up');
                el.classList.add('fa-chevron-down');
            });
        }
    });

        navigator.getBattery().then(battery => {
            function updateBattery() {
                document.getElementById('battery-status').textContent = `${Math.round(battery.level * 100)}%`;
            }
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
        });

        
            document.getElementById('tqto').innerHTML = set.developer.map(e => `<div class="text-blue-900 font-medium"><a class="flex items-center" href=${e.contact}>— ${e.name}</a></div>`).join("\n")

        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => document.getElementById('ip-address').textContent = `${data.ip}`);
            }
            
            
                function toggleDropdown(dropdownId, chevronId) {
        const dropdown = document.getElementById(dropdownId);
        const chevron = document.getElementById(chevronId);

        // Tutup semua dropdown yang lain
        document.querySelectorAll('.relative > div').forEach(el => {
            if (el.id !== dropdownId) el.classList.add('hidden');
        });

        document.querySelectorAll('.relative > button > i.float-right').forEach(el => {
            if (el.id !== chevronId) {
                el.classList.remove('fa-chevron-up');
                el.classList.add('fa-chevron-down');
            }
        });

        // Toggle dropdown yang dipilih
        dropdown.classList.toggle('hidden');
        chevron.classList.toggle('fa-chevron-down');
        chevron.classList.toggle('fa-chevron-up');
    }
            
            loadSettings()
