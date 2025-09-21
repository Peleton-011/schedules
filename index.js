const body = document.querySelector("body");

const initialCourses = {
	"Cult.Barroca": {
		seg: { start: "13:30", end: "15:00" },
		qui: { start: "11:30", end: "13:00" },
	},
	Metafisica: {
		qua: { start: "13:30", end: "16:30" },
	},
	Açao: {
		seg: { start: "15:00", end: "18:00" },
	},
	Cartografia: {
		ter: { start: "15:00", end: "18:00" },
	},
	LogLin: {
		qua: { start: "08:30", end: "10:00" },
		qui: { start: "10:00", end: "11:30" },
	},
	PortugalXX: {
		qua: { start: "13:30", end: "15:00" },
		qui: { start: "11:30", end: "13:00" },
	},
	Mente: {
		ter: { start: "13:30", end: "15:00" },
		qua: { start: "15:00", end: "16:30" },
	},
	FiloComp: {
		qui: { start: "13:30", end: "16:30" },
	},
	FiloContemp: { ter: { start: "16:30", end: "19:30" } },
	CultContemp: {
		seg: { start: "08:30", end: "10:00" },
		qua: { start: "08:30", end: "10:00" },
	},
};

const courses = {};

try {
	localStorage.setItem("courses", JSON.stringify(initialCourses));
} catch {}

try {
	const saved = localStorage.getItem("courses");
	if (saved) {
		const parsed = JSON.parse(saved);
		if (parsed && typeof parsed === "object")
			Object.assign(courses, parsed);
	}
} catch {}

const days = ["seg", "ter", "qua", "qui", "sex"];

// TIMES vv

const times = [
	"08:30",
	"10:00",
	"11:30",
	"13:00",
	"13:30",
	"15:00",
	"16:30",
	"18:00",
	"19:30",
];

function normalizeTime(time) {
	return {
		hours: Number(time.split(":")[0]),
		minutes: Number(time.split(":")[1]),
	};
}

function timeToNumber(time) {
	return time.hours + time.minutes / 60;
}

function numberToTime(time) {
	return {
		hours: Math.floor(time),
		minutes: Math.round((time - Math.floor(time)) * 60),
	};
}

const normalizedTimes = times
	.map(normalizeTime)
	.map(timeToNumber)
	.sort((a, b) => a - b)
	.map(numberToTime);

function timesToPercentile(times) {
	const percentileTimes = times
		.map(timeToNumber)
		.map(
			(time) =>
				(time - timeToNumber(times[0])) /
				(timeToNumber(times[times.length - 1]) - timeToNumber(times[0]))
		);
	return percentileTimes.map((time) => (time * 100).toFixed(2));
}

// TIMES ^^

// COLORS vv
function generateDistinctColors(n) {
	const colors = [];

	for (let i = 0; i < n; i++) {
		// Spread hues evenly
		const hue = Math.round((360 * i) / n);

		// Randomize saturation and lightness slightly for variety
		const saturation = 60 + Math.random() * 20; // 60-80%
		const lightness = 50 + Math.random() * 10; // 50-60%

		// Convert HSL to HEX
		const color = hslToHex(hue, saturation, lightness);
		colors.push(color);
	}

	return colors;
}

/**
 * Convert HSL to HEX
 */
function hslToHex(h, s, l) {
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0,
		g = 0,
		b = 0;

	if (h < 60) [r, g, b] = [c, x, 0];
	else if (h < 120) [r, g, b] = [x, c, 0];
	else if (h < 180) [r, g, b] = [0, c, x];
	else if (h < 240) [r, g, b] = [0, x, c];
	else if (h < 300) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];

	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const courseColors = generateDistinctColors(Object.keys(courses).length);

// COLORS ^^

function drawSchedule() {
	const table = document.createElement("div");

	table.classList.add("table");
	body.appendChild(table);

	const percentileTimes = timesToPercentile(normalizedTimes);

	// Time Marks
	for (let i = 0; i < normalizedTimes.length; i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		row.style.position = "absolute";
		row.style.top = `calc(${percentileTimes[i]}% - 0.5rem)`;
		row.style.left = "-3rem";
		row.style.width = "100%";
		table.appendChild(row);

		const cell = document.createElement("div");
		cell.classList.add("cell");
		cell.textContent =
			normalizedTimes[i].hours + ":" + normalizedTimes[i].minutes;
		row.appendChild(cell);

		if (i == 0 || i == normalizedTimes.length - 1) {
			continue;
		}
		const line = document.createElement("div");
		line.classList.add("hline");
		line.style.position = "relative";
		line.style.left = "3rem";
		line.style.top = "-0.6rem";
		row.appendChild(line);
	}

	// Days

	for (let i = 0; i < days.length; i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		row.style.position = "absolute";
		row.style.top = "0";
		row.style.height = "100%";
		row.style.left = `calc(${(i * 100) / days.length}% + 2rem)`;
		table.appendChild(row);

		const cell = document.createElement("div");
		cell.classList.add("cell");
		cell.textContent = days[i];
		row.appendChild(cell);

		if (i == days.length - 1) {
			continue;
		}

		const line = document.createElement("div");
		line.classList.add("vline");
		line.style.position = "relative";
		line.style.left = "4rem";
		line.style.top = "-1rem";
		row.appendChild(line);
	}

	// Courses

	for (const courseName in courses) {
		const course = courses[courseName];

		for (const day in course) {
			const courseTime = course[day];

			const courseTimeStart = times.findIndex(
				(time) => time == courseTime.start
			);
			const courseTimeEnd = times.findIndex(
				(time) => time == courseTime.end
			);

			const courseTimeStartPercentile =
				timesToPercentile(normalizedTimes)[courseTimeStart];
			const courseTimeEndPercentile =
				timesToPercentile(normalizedTimes)[courseTimeEnd];

			const courseDayIndex = days.findIndex((currday) => currday == day);

			const courseDayPercentile =
				(courseDayIndex * 100) / days.length - 1;
			console.log(courseDayPercentile);
			console.log(courseDayIndex);
			console.log(day);
			const courseWidth = 100 / days.length;
			const courseHeight =
				courseTimeEndPercentile - courseTimeStartPercentile;

			const courseDiv = document.createElement("div");
			courseDiv.classList.add("course", courseName);
			courseDiv.style.position = "absolute";
			courseDiv.style.top = `${courseTimeStartPercentile}%`;
			courseDiv.style.left = `${courseDayPercentile}%`;
			courseDiv.style.width = `${courseWidth}%`;
			courseDiv.style.height = `${courseHeight}%`;
			courseDiv.style.backgroundColor =
				courseColors[Object.keys(courses).indexOf(courseName)];
			courseDiv.style.borderRadius = "10px";
			courseDiv.textContent = courseName;
			table.appendChild(courseDiv);
		}
	}

	// Toggles

	const toggles = document.createElement("div");
	toggles.classList.add("toggles");

	for (const courseName in courses) {
		const group = document.createElement("div");
		group.classList.add("group");

		const toggle = document.createElement("input");
		toggle.addEventListener("change", () => {
			const courseDivs = document.getElementsByClassName(courseName);
			if (toggle.checked) {
				Array.from(courseDivs).map(
					(div) => (div.style.display = "block")
				);
			} else {
				Array.from(courseDivs).map(
					(div) => (div.style.display = "none")
				);
			}
			updateConflicts();
		});
		toggle.type = "checkbox";
		toggle.checked = true;
		toggle.id = courseName;
		toggle.style.accentColor =
			courseColors[Object.keys(courses).indexOf(courseName)];
		group.appendChild(toggle);

		const label = document.createElement("label");
		label.htmlFor = courseName;
		label.textContent = courseName;
		group.appendChild(label);
		toggles.appendChild(group);
	}

	// Conflicts

	const conflictsDiv = document.createElement("div");
	conflictsDiv.classList.add("conflicts");
	conflictsDiv.textContent = "Conflicts: ";

	const conflicts = findConflicts(courses);
	conflicts.forEach((conflict) => {
		const conflictDiv = document.createElement("div");
		conflictDiv.classList.add("conflict");
		conflictDiv.textContent = conflict.join("//");
		conflictsDiv.appendChild(conflictDiv);
	});

	// Possible Combinations

	const combinationsElem = document.createElement("fieldset");
	combinationsElem.classList.add("combinations");
	combinationsElem.textContent = "Possible Combinations: ";

	const combinations = findAllCombinations(courses);
	combinations.forEach((combination, index) => {
		const combinationDiv = document.createElement("div");
		combinationDiv.classList.add("combination");

		const radioBtn = document.createElement("input");
		radioBtn.addEventListener("change", () => {
			console.log("changed!");
			const allToggles = document.querySelectorAll(
				"div.toggles > div.group > input[type='checkbox']"
			);
			const combinationToggles = combination.map((courseName) =>
				document.getElementById(courseName)
			);

			allToggles.forEach((toggle) => {
				if (toggle.checked) {
					toggle.checked = false;
					toggle.dispatchEvent(new Event("change"));
				}
			});

			combinationToggles.forEach((toggle) => {
				if (!toggle.checked) {
					toggle.checked = true;
					toggle.dispatchEvent(new Event("change"));
				}
			});
		});
		radioBtn.type = "radio";
		radioBtn.checked = false;
		radioBtn.name = "combination";
		radioBtn.value = index;
		radioBtn.id = index;
		const label = document.createElement("label");
		label.htmlFor = index;
		label.textContent = combination.join(", ");
		combinationDiv.appendChild(radioBtn);
		combinationDiv.appendChild(label);

		combinationsElem.appendChild(combinationDiv);
	});

	//Alt

	const alt = document.createElement("div");
	alt.classList.add("alt");
	alt.appendChild(toggles);
	alt.appendChild(conflictsDiv);
	alt.appendChild(combinationsElem);
	body.appendChild(alt);
}

function findConflicts(courses) {
	// Make full timetables
	const timetable = {};
	days.forEach((day) => {
		timetable[day] = [];
	});
	for (const courseName in courses) {
		const course = courses[courseName];

		for (const day in course) {
			timetable[day].push({
				name: courseName,
				start: course[day].start,
				end: course[day].end,
			});
		}
	}

	// Find conflicts
	const conflicts = [];
	for (const day in timetable) {
		for (let i = 0; i < timetable[day].length; i++) {
			for (let j = i + 1; j < timetable[day].length; j++) {
				if (
					timetable[day][i].end > timetable[day][j].start &&
					timetable[day][i].start < timetable[day][j].end
				) {
					conflicts.push([
						timetable[day][i].name,
						timetable[day][j].name,
					]);
				}
			}
		}
	}
	return conflicts;
}

function updateConflicts() {
	const conflictsDiv = document.querySelector(".conflicts");
	conflictsDiv.innerHTML = "Conflicts: ";

	const conflicts = findConflicts(courses);

	const table = document.querySelector(".table");

	let error = false;

	conflicts.forEach((conflict) => {
		const [courseA, courseB] = conflict;
		const conflictDiv = document.createElement("div");
		conflictDiv.classList.add("conflict");
		conflictDiv.textContent = conflict.join(", ");

		// Check if both courses are selected
		const toggleA = document.getElementById(courseA);
		const toggleB = document.getElementById(courseB);

		if (toggleA.checked && toggleB.checked) {
			conflictDiv.style.color = "red";
			conflictDiv.style.fontWeight = "bold";
			error = true;
		} else {
			conflictDiv.style.color = "black";
			conflictDiv.style.fontWeight = "normal";
			error = error || false;
		}

		conflictsDiv.appendChild(conflictDiv);
	});

	if (error) {
		table.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
		table.style.borderColor = "red";
		table.style.borderWidth = "5px";
	} else {
		table.style.backgroundColor = "white";
		table.style.borderColor = "black";
		table.style.borderWidth = "1px";
	}
}

function findAllCombinations(courses, courseAmount = 5) {
	const conflicts = findConflicts(courses);
	const courseNames = Object.keys(courses);
	const combinations = [];
	const seen = new Set();

	const checkConflicts = (combination, newCourseName) => {
		return combination.some((existingCourse) =>
			conflicts.some(
				(conflict) =>
					conflict.includes(existingCourse) &&
					conflict.includes(newCourseName)
			)
		);
	};

	const backtrack = (combination, startIndex) => {
		if (combination.length === courseAmount) {
			const key = combination.join("-");
			if (!seen.has(key)) {
				seen.add(key);
				combinations.push([...combination]);
			}
			return;
		}

		for (let i = startIndex; i < courseNames.length; i++) {
			const courseName = courseNames[i];
			if (
				!combination.includes(courseName) &&
				!checkConflicts(combination, courseName)
			) {
				combination.push(courseName);
				backtrack(combination, i + 1);
				combination.pop();
			}
		}
	};

	backtrack([], 0);
	return combinations;
}

// Course input

// === Simple Course Input UI ===
// Assumes you already have: `const days = [...]`, `const times = [...]`, `const courses = {...}`
// and your drawSchedule() + updateConflicts() functions.

function mountCourseForm() {
	const host = document.createElement("div");
	host.className = "course-form";
	host.style.marginTop = "1rem";
	host.style.padding = "0.75rem";
	host.style.border = "1px solid #ddd";
	host.style.borderRadius = "8px";
	host.style.maxWidth = "640px";
	host.style.fontFamily = "system-ui, sans-serif";

	host.innerHTML = `
    <h3 style="margin:0 0 .5rem 0;">Add / Edit Course</h3>
    <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
      <label style="min-width:7rem;">Course name</label>
      <input id="cf-name" type="text" placeholder="e.g. Metafisica" style="flex:1; padding:.4rem .6rem; border:1px solid #ccc; border-radius:6px;" />
    </div>

    <div id="cf-rows" style="margin-top:.75rem; display:grid; gap:.5rem;"></div>

    <div style="display:flex; gap:.5rem; margin-top:.5rem;">
      <button id="cf-add-row" type="button">+ Add day/time</button>
      <button id="cf-clear-rows" type="button">Clear rows</button>
      <button id="cf-fill-existing" type="button" title="Load an existing course into the form">Load existing</button>
      <select id="cf-existing" style="margin-left:auto;">
        <option value="">— Existing courses —</option>
        ${Object.keys(courses)
			.map((c) => `<option value="${c}">${c}</option>`)
			.join("")}
      </select>
    </div>

    <div style="display:flex; gap:.5rem; margin-top:.75rem;">
      <button id="cf-save" type="button" style="background:#111;color:#fff;border:none;padding:.5rem .8rem;border-radius:6px;">Save course</button>
      <button id="cf-delete" type="button" style="margin-left:auto; color:#b00020;">Delete course</button>
    </div>

    <details style="margin-top:.75rem;">
      <summary>Import / Export JSON</summary>
      <div style="display:flex; gap:.5rem; margin-top:.5rem;">
        <button id="cf-export" type="button">Export</button>
        <button id="cf-import" type="button">Import</button>
      </div>
      <textarea id="cf-json" rows="6" style="width:100%; margin-top:.5rem; font-family:monospace;"></textarea>
    </details>
  `;

	document.body.appendChild(host);

	const rowsHost = host.querySelector("#cf-rows");
	const nameInput = host.querySelector("#cf-name");
	const existingSelect = host.querySelector("#cf-existing");

	function makeSelect(options, value) {
		const sel = document.createElement("select");
		sel.innerHTML = options
			.map((v) => `<option value="${v}">${v}</option>`)
			.join("");
		if (value) sel.value = value;
		sel.style.padding = ".3rem .5rem";
		sel.style.border = "1px solid #ccc";
		sel.style.borderRadius = "6px";
		return sel;
	}

	function addRow(init = { day: days[0], start: times[0], end: times[1] }) {
		const row = document.createElement("div");
		row.style.display = "grid";
		row.style.gridTemplateColumns = "120px 1fr 1fr auto";
		row.style.alignItems = "center";
		row.style.gap = ".5rem";

		const daySel = makeSelect(days, init.day);
		const startSel = makeSelect(times, init.start);
		const endSel = makeSelect(times, init.end);
		const del = document.createElement("button");
		del.type = "button";
		del.textContent = "✕";
		del.title = "Remove row";
		del.style.border = "none";
		del.style.background = "transparent";
		del.style.fontSize = "1rem";
		del.style.cursor = "pointer";

		del.addEventListener("click", () => row.remove());

		row.appendChild(daySel);
		row.appendChild(startSel);
		row.appendChild(endSel);
		row.appendChild(del);
		rowsHost.appendChild(row);
	}

	// Controls
	host.querySelector("#cf-add-row").addEventListener("click", () => addRow());
	host.querySelector("#cf-clear-rows").addEventListener(
		"click",
		() => (rowsHost.innerHTML = "")
	);

	host.querySelector("#cf-fill-existing").addEventListener("click", () => {
		const name = existingSelect.value;
		if (!name || !courses[name]) return;
		nameInput.value = name;
		rowsHost.innerHTML = "";
		const course = courses[name];
		Object.keys(course).forEach((day) => {
			addRow({ day, start: course[day].start, end: course[day].end });
		});
	});

	host.querySelector("#cf-save").addEventListener("click", () => {
		const name = nameInput.value.trim();
		if (!name) {
			alert("Please enter a course name.");
			return;
		}

		const rows = Array.from(rowsHost.children);
		if (!rows.length) {
			alert("Add at least one day/time row.");
			return;
		}

		// Build the course entry { day: {start, end}, ... }
		const entry = {};
		for (const row of rows) {
			const [daySel, startSel, endSel] = row.querySelectorAll("select");
			const day = daySel.value;
			const start = startSel.value;
			const end = endSel.value;

			// Validate ordering
			const startIdx = times.indexOf(start);
			const endIdx = times.indexOf(end);
			if (startIdx === -1 || endIdx === -1) {
				alert("Invalid time selected.");
				return;
			}
			if (endIdx <= startIdx) {
				alert(`End must be after start for ${day}.`);
				return;
			}

			entry[day] = { start, end };
		}

		// Merge into courses
		courses[name] = entry;

		// Persist (optional)
		try {
			localStorage.setItem("courses", JSON.stringify(courses));
		} catch {}

		// Re-render schedule + conflicts
		rerenderSchedule();
	});

	host.querySelector("#cf-delete").addEventListener("click", () => {
		const name = nameInput.value.trim();
		if (!name) return;
		if (!courses[name]) {
			alert("Course not found.");
			return;
		}
		if (!confirm(`Delete course "${name}"?`)) return;
		delete courses[name];
		try {
			localStorage.setItem("courses", JSON.stringify(courses));
		} catch {}
		nameInput.value = "";
		rowsHost.innerHTML = "";
		rerenderSchedule();
	});

	host.querySelector("#cf-export").addEventListener("click", () => {
		const ta = host.querySelector("#cf-json");
		ta.value = JSON.stringify(courses, null, 2);
		ta.select();
		try {
			document.execCommand("copy");
		} catch {}
	});

	host.querySelector("#cf-import").addEventListener("click", () => {
		const ta = host.querySelector("#cf-json");
		try {
			const parsed = JSON.parse(ta.value);
			// very light validation
			if (typeof parsed !== "object" || Array.isArray(parsed))
				throw new Error("Invalid JSON");
			Object.assign(courses, parsed);
			localStorage.setItem("courses", JSON.stringify(courses));
			// refresh existing list
			existingSelect.innerHTML =
				`<option value="">— Existing courses —</option>` +
				Object.keys(courses)
					.map((c) => `<option value="${c}">${c}</option>`)
					.join("");
			rerenderSchedule();
		} catch (e) {
			alert("Invalid JSON.");
		}
	});
}

function rerenderSchedule() {
	// remove previous render
	document.querySelectorAll(".table, .alt").forEach((el) => el.remove());

	// re-run your schedule + conflicts
	drawSchedule();
	if (typeof updateConflicts === "function") updateConflicts();
}

// Mount the form after your initial render:
mountCourseForm();

drawSchedule();
updateConflicts();
