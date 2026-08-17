let simulationHours = 28;
let aiReviews = 46;


/* =========================================================
   DATA LAYER — نقطة وحيدة للوصول للبيانات
   لما نربط بالـ Backend، هاي أهم مكان نبدله: بدل ما القراءة/الكتابة
   تصير من localStorage مباشرة، بتصير fetch('/api/...') من هون بس —
   باقي الكود (renderProjects, updateStats, إلخ) ما بيحتاج يتغير.
   ========================================================= */

const DB = {
    get(key, fallback) {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw;
    },
    set(key, value) {
        localStorage.setItem(key, value);
    },
    getJSON(key, fallback) {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },
    setJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};


/* =========================================================
   SECURITY: escape any user-typed text before it goes into innerHTML
   (project names come from prompt()/a form — never trust them raw)
   ========================================================= */

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}


/* =========================================================
   ONE-TIME STATS RESET (runs once per browser, then never again)
   ========================================================= */

if (!localStorage.getItem('resetDone_v1')) {
    localStorage.setItem('aiReviews', 0);
    localStorage.setItem('simHours', 0);
    Object.keys(localStorage)
        .filter(key => key.startsWith('hoursAdded_'))
        .forEach(key => localStorage.removeItem(key));
    localStorage.setItem('resetDone_v1', 'true');
}


/* =========================================================
   LABS
   ========================================================= */

const labsList = [
    {
        name: "Embedded Lab",
        link: "../simulation/embedded2.html",
        icon: "fa-laptop-code"
    },

    {
        name: "Assembly",
        link: "../simulation/assembly.html",
        icon: "fa-code"
    },

    {
        name: "Circuit",
        link: "../simulation/circuits.html",
        icon: "fa-bolt"
    },

    {
        name: "Network Lab",
        link: "../simulation/network.html",
        icon: "fa-microchip"
    }
];


/* =========================================================
   SEARCH
   ========================================================= */

function filterLabs() {

    const searchInput =
        document.getElementById("searchInput");

    const resultsBox =
        document.getElementById("searchResults");


    if (!searchInput || !resultsBox) {
        return;
    }


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    resultsBox.innerHTML = "";


    if (query === "") {

        resultsBox.style.display =
            "none";

        return;
    }


    const matches =
        labsList.filter(lab =>
            lab.name
                .toLowerCase()
                .includes(query)
        );


    if (matches.length === 0) {

        resultsBox.innerHTML = `
            <div class="search-item no-match">
                No labs found
            </div>
        `;

    } else {

        matches.forEach(lab => {

            resultsBox.innerHTML += `
                <div
                    class="search-item"
                    onclick="location.href='${lab.link}'"
                >
                    <i class="fa-solid ${lab.icon}"></i>
                    <span>${lab.name}</span>
                </div>
            `;

        });

    }


    resultsBox.style.display =
        "block";
}


/* Close search when clicking outside */

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".search-wrapper"
            )
        ) {

            const results =
                document.getElementById(
                    "searchResults"
                );


            if (results) {

                results.style.display =
                    "none";

            }

        }

    }
);


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getMyProjects() {
    return DB.getJSON("myProjects", []);
}


function saveMyProjects(projects) {
    DB.setJSON("myProjects", projects);

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {

    const projects =
        getMyProjects();


    const completed =
        projects.filter(
            project =>
                project.status ===
                "status-completed"
        ).length;


    const pending =
        projects.length -
        completed;


    const reviews =
        parseInt(
            localStorage.getItem(
                "aiReviews"
            )
        ) || 0;


    const hours =
        parseInt(
            localStorage.getItem(
                "simHours"
            )
        ) || 0;


    const completedElement =
        document.getElementById(
            "completedCount"
        );


    const pendingElement =
        document.getElementById(
            "pendingCount"
        );


    const reviewsElement =
        document.getElementById(
            "reviewsCount"
        );


    const hoursElement =
        document.getElementById(
            "hoursCount"
        );


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (reviewsElement) {

        reviewsElement.textContent =
            reviews;

    }


    if (hoursElement) {

        hoursElement.textContent =
            hours + "h";

    }

}


/* =========================================================
   RECENT ACTIVITY
   ========================================================= */

function updateActivity() {

    const activity =
        JSON.parse(
            localStorage.getItem(
                "recentActivity"
            )
        ) || [];


    const listBox =
        document.getElementById(
            "activityList"
        );


    if (!listBox) {
        return;
    }


    if (activity.length === 0) {

        listBox.innerHTML = `
            <p>
                No activity yet — complete a lab to see it here.
            </p>
        `;

        return;
    }


    listBox.innerHTML =
        activity
            .map(item => {

                return `
                    <p>
                        ✔ ${item.lab}
                        Completed — ${item.time}
                    </p>
                `;

            })
            .join("");

}


/* =========================================================
   LAB LABELS
   ========================================================= */

const labLabels = {

    embedded:
        "Embedded Lab",

    assembly:
        "Assembly",

    circuit:
        "Circuit",

    network:
        "Network Lab"

};


/* =========================================================
   LAB LINKS
   ========================================================= */

const labLinks = {

    embedded:
        "../simulation/embedded2.html",

    assembly:
        "../simulation/assembly.html",

    circuit:
        "../simulation/circuits.html",

    network:
        "../simulation/network.html"

};


/* =========================================================
   STATUS LABELS
   ========================================================= */

const statusLabels = {

    "status-completed":
        "Completed",

    "status-progress":
        "In Progress",

    "status-testing":
        "Testing"

};


/* =========================================================
   PROJECT SUGGESTIONS
   ========================================================= */

const originalSuggestionsList = [

    {
        name:
            "IoT Motion Sensor",

        lab:
            "embedded"
    },

    {
        name:
            "ESP32 Smart Home",

        lab:
            "embedded"
    },

    {
        name:
            "Assembly Calculator",

        lab:
            "assembly"
    },

    {
        name:
            "Circuit Simulation",

        lab:
            "circuit"
    },

    {
        name:
            "Arduino Traffic Light",

        lab:
            "network"
    }

];


let suggestions =
    [...originalSuggestionsList];


/* =========================================================
   RENDER PROJECTS
   ========================================================= */

function renderProjects() {

    let projects =
        getMyProjects();


    let needsSave =
        false;


    /* Give old projects IDs */

    projects.forEach(project => {

        if (!project.id) {

            project.id =
                Date.now().toString() +
                Math.floor(
                    Math.random() * 1000
                );

            needsSave =
                true;
        }

    });


    if (needsSave) {

        saveMyProjects(
            projects
        );

    }


    const listBox =
        document.getElementById(
            "myProjectsList"
        );


    if (!listBox) {
        return;
    }


    /* =====================================================
       MY PROJECTS
       ===================================================== */

    if (projects.length === 0) {

        listBox.innerHTML = `
            <p class="empty-note">
                No projects yet — add one or pick a suggestion below.
            </p>
        `;

    } else {

        listBox.innerHTML =
            projects
                .map(
                    (project, index) => {

                        return `
                            <div class="project">

                                <div>

                                    <span
                                        class="project-name-link"
                                        onclick="location.href='${labLinks[project.lab]}?project=${project.id}'"
                                    >
                                        ${escapeHtml(project.name)}
                                    </span>

                                    <span class="lab-tag">
                                        ${labLabels[project.lab]}
                                    </span>

                                </div>


                                <span
                                    class="status ${project.status}"
                                    onclick="cycleProjectStatus(${index})"
                                >
                                    ${statusLabels[project.status]}
                                </span>


                                <span
                                    class="delete-project-btn"
                                    onclick="deleteProject(${index})"
                                    title="Delete project"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </span>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       PROJECT SUGGESTIONS
       ===================================================== */

    const suggestionsBox =
        document.getElementById(
            "suggestionsList"
        );


    if (!suggestionsBox) {
        return;
    }


    suggestionsBox.innerHTML =
        suggestions
            .map(
                suggestion => {

                    return `
                        <div class="suggestion-item">

                            <div>

                                <span class="suggestion-name">
                                    ${suggestion.name}
                                </span>

                                <span class="lab-tag">
                                    ${labLabels[suggestion.lab]}
                                </span>

                            </div>


                            <button
                                class="add-suggestion-btn"
                                onclick="addSuggestion('${suggestion.name}', '${suggestion.lab}')"
                            >
                                + Add
                            </button>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   ADD PROJECT
   ========================================================= */

function addSuggestion(name, lab) {

    const projects =
        getMyProjects();


    /* Prevent duplicate projects */

    const alreadyExists =
        projects.some(
            project =>
                project.name === name &&
                project.lab === lab
        );


    if (alreadyExists) {

        return;
    }


    const newProject = {

        id:
            Date.now().toString(),

        name:
            name,

        lab:
            lab,

        status:
            "status-progress"

    };


    projects.unshift(
        newProject
    );


    saveMyProjects(
        projects
    );


    /* Remove from suggestions */

    const suggestionIndex =
        suggestions.findIndex(
            suggestion =>
                suggestion.name === name &&
                suggestion.lab === lab
        );


    if (suggestionIndex !== -1) {

        suggestions.splice(
            suggestionIndex,
            1
        );

    }


    renderProjects();

    updateStats();

    updateWelcome();

}


/* =========================================================
   DELETE PROJECT
   ========================================================= */

function deleteProject(index) {

    const projects =
        getMyProjects();


    const removed =
        projects[index];


    if (!removed) {
        return;
    }


    projects.splice(
        index,
        1
    );


    saveMyProjects(
        projects
    );


    /* Restore original suggestion */

    const original =
        originalSuggestionsList.find(
            suggestion =>
                suggestion.name ===
                    removed.name &&
                suggestion.lab ===
                    removed.lab
        );


    if (
        original &&
        !suggestions.some(
            suggestion =>
                suggestion.name ===
                    removed.name &&
                suggestion.lab ===
                    removed.lab
        )
    ) {

        suggestions.push(
            original
        );

    }


    /* Remove saved project progress */

    localStorage.removeItem(
        "projectProgress_" +
        removed.id
    );


    renderProjects();

    updateActivity();

    updateStats();

    updateWelcome();

}


/* =========================================================
   PROJECT STATUS
   ========================================================= */

function cycleProjectStatus(index) {

    const order = [

        "status-completed",

        "status-progress",

        "status-testing"

    ];


    const projects =
        getMyProjects();


    if (!projects[index]) {
        return;
    }


    let current =
        order.indexOf(
            projects[index].status
        );


    if (current === -1) {

        current = 1;

    }


    const next =
        (current + 1) %
        order.length;


    const wasCompleted =
        projects[index].status ===
        "status-completed";


    const willBeCompleted =
        order[next] ===
        "status-completed";


    projects[index].status =
        order[next];


    saveMyProjects(
        projects
    );


    /* =====================================================
       STATISTICS
       ===================================================== */

    let reviews =
        parseInt(
            localStorage.getItem(
                "aiReviews"
            )
        ) || 0;


    let hours =
        parseInt(
            localStorage.getItem(
                "simHours"
            )
        ) || 0;


    /* Project became completed */

    if (
        willBeCompleted &&
        !wasCompleted
    ) {

        reviews += 1;


        const hoursAdded =
            Math.floor(
                Math.random() * 2
            ) + 1;


        hours +=
            hoursAdded;


        localStorage.setItem(
            "hoursAdded_project_" +
            projects[index].id,

            hoursAdded
        );

    }


    /* Project stopped being completed */

    else if (
        wasCompleted &&
        !willBeCompleted
    ) {

        reviews =
            Math.max(
                0,
                reviews - 1
            );


        const key =
            "hoursAdded_project_" +
            projects[index].id;


        const hoursAdded =
            parseInt(
                localStorage.getItem(
                    key
                )
            ) || 1;


        hours =
            Math.max(
                0,
                hours - hoursAdded
            );


        localStorage.removeItem(
            key
        );

    }


    localStorage.setItem(
        "aiReviews",
        reviews
    );


    localStorage.setItem(
        "simHours",
        hours
    );


    /* =====================================================
       RECENT ACTIVITY
       ===================================================== */

    let activity =
        JSON.parse(
            localStorage.getItem(
                "recentActivity"
            )
        ) || [];


    const projectName =
        projects[index].name;


    /* Completed */

    if (willBeCompleted) {

        activity.unshift({

            lab:
                projectName,

            time:
                new Date()
                    .toLocaleString()

        });


        activity =
            activity.slice(0, 4);

    }


    /* Uncompleted */

    else if (wasCompleted) {

        const activityIndex =
            activity.findIndex(
                item =>
                    item.lab ===
                    projectName
            );


        if (activityIndex !== -1) {

            activity.splice(
                activityIndex,
                1
            );

        }

    }


    localStorage.setItem(
        "recentActivity",
        JSON.stringify(activity)
    );


    renderProjects();

    updateActivity();

    updateStats();

    updateWelcome();

}


/* =========================================================
   ADD PROJECT MODAL
   ========================================================= */

function openAddProjectModal() {

    const modal =
        document.getElementById(
            "addProjectModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function closeAddProjectModal() {

    const modal =
        document.getElementById(
            "addProjectModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    renderProjects();

    updateStats();

    updateWelcome();

}


/* =========================================================
   PERSONALIZED WELCOME
   =========================================================

   FIRST VISIT:
   Welcome to Virtual Hub 👋

   RETURN WITHIN 7 DAYS:
   Welcome back 👋

   AWAY MORE THAN 7 DAYS:
   We missed you 💜

   ACTIVE PROJECT:
   Show project + Continue Project

   ========================================================= */

function updateWelcome() {

    const titleElement =
        document.getElementById(
            "welcomeTitle"
        );


    const messageElement =
        document.getElementById(
            "welcomeMessage"
        );


    const metaElement =
        document.getElementById(
            "welcomeMeta"
        );


    /*
        IMPORTANT:

        There is NO welcomeBadge here.

        So the small "VIRTUAL HUB"
        text is completely removed.
    */

    if (
        !titleElement ||
        !messageElement
    ) {

        return;
    }


    /* Current time */

    const now =
        Date.now();


    /* Last visit */

    const lastVisit =
        parseInt(
            localStorage.getItem(
                "virtualHubLastVisit"
            )
        ) || 0;


    /* Has user visited before? */

    const hasVisited =
        localStorage.getItem(
            "virtualHubHasVisited"
        ) === "true";


    /* User projects */

    const projects =
        getMyProjects();


    /* Active projects */

    const activeProjects =
        projects.filter(
            project =>
                project.status !==
                "status-completed"
        );


    /* Completed projects */

    const completedProjects =
        projects.filter(
            project =>
                project.status ===
                "status-completed"
        );


    let title = "";

    let message = "";

    let meta = "";


    /* =====================================================
       FIRST VISIT
       ===================================================== */

    if (!hasVisited) {

        title =
            "Welcome to Virtual Hub 👋";


        message =
            "Your engineering journey starts here. Build, simulate, test, and learn.";


        meta =
            "Ready to start your first engineering simulation?";

    }


    /* =====================================================
       MORE THAN 7 DAYS AWAY
       ===================================================== */

    else if (
        lastVisit > 0 &&
        (
            now - lastVisit
        ) >
        (
            7 *
            24 *
            60 *
            60 *
            1000
        )
    ) {

        title =
            "We missed you 💜";


        message =
            "It's been a while. Your engineering labs are waiting for you.";


        /*
            Generic message regardless of
            whether there's an active project.
        */

        meta =
            "Ready to get back to building?";

    }


    /* =====================================================
       RETURN WITHIN 7 DAYS
       ===================================================== */

    else {

        title =
            "Welcome back 👋";


        message =
            "Ready to continue your engineering journey?";


        if (
            activeProjects.length > 0
        ) {

            meta =
                `You have ${
                    activeProjects.length
                } active project${
                    activeProjects.length === 1
                        ? ""
                        : "s"
                } in progress.`;

        }

        else if (
            completedProjects.length > 0
        ) {

            meta =
                `Great work! You've completed ${
                    completedProjects.length
                } project${
                    completedProjects.length === 1
                        ? ""
                        : "s"
                }.`;

        }

        else {

            meta =
                "Pick a lab and start building something new.";

        }

    }


    /* =====================================================
       ACTIVE PROJECT COUNT
       ===================================================== */

    if (
        activeProjects.length > 0
    ) {

        meta += `
            <span class="welcome-progress">

                <i class="fa-solid fa-layer-group"></i>

                ${activeProjects.length}

                active project${
                    activeProjects.length === 1
                        ? ""
                        : "s"
                }

            </span>
        `;

    }


    /* =====================================================
       UPDATE HTML
       ===================================================== */

    titleElement.textContent =
        title;


    messageElement.textContent =
        message;


    if (metaElement) {

        metaElement.innerHTML =
            meta;

    }


    /*
        VERY IMPORTANT:

        Save the visit AFTER choosing
        the correct welcome message.

        This means:

        Day 1:
        Welcome to Virtual Hub

        Day 3:
        Welcome back

        Day 10:
        We missed you

        Day 11:
        Welcome back
    */

    localStorage.setItem(
        "virtualHubLastVisit",
        now.toString()
    );


    localStorage.setItem(
        "virtualHubHasVisited",
        "true"
    );

}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            const modal =
                document.getElementById(
                    "addProjectModal"
                );


            const results =
                document.getElementById(
                    "searchResults"
                );


            /* Close search */

            if (results) {

                results.style.display =
                    "none";

            }


            /* Close modal */

            if (
                modal &&
                modal.style.display ===
                "flex"
            ) {

                closeAddProjectModal();

            }

        }

    }
);


/* =========================================================
   CLOSE MODAL BY CLICKING BACKDROP
   ========================================================= */

const modal =
    document.getElementById(
        "addProjectModal"
    );


if (modal) {

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modal
            ) {

                closeAddProjectModal();

            }

        }
    );

}


/* =========================================================
   SIDEBAR KEYBOARD ACCESS
   ========================================================= */

document
    .querySelectorAll(
        ".sidebar li[role='link']"
    )
    .forEach(
        function(item) {

            item.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                            "Enter" ||
                        event.key ===
                            " "
                    ) {

                        event.preventDefault();

                        item.click();

                    }

                }
            );

        }
    );


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    function() {

        updateStats();

        updateActivity();

        renderProjects();

        updateWelcome();

    }
);