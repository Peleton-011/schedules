const body = document.querySelector("body");

const initialCourses = {
	"Cult.Barroca": {
		seg: { start: "13:30", end: "15:00", info: "G402" },
		qui: { start: "11:30", end: "13:00", info: "G403" },
	},
	Metafisica: {
		qua: { start: "13:30", end: "16:30", info: "G404" },
	},
	Açao: {
		seg: { start: "15:00", end: "18:00", info: "G405" },
	},
	Cartografia: {
		ter: { start: "15:00", end: "18:00", info: "G406" },
	},
	LogLin: {
		qua: { start: "08:30", end: "10:00", info: "G407" },
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
		seg: { start: "08:30", end: "10:00", info: "G402" },
		qua: { start: "08:30", end: "10:00", info: "G403" },
	},
};

const courses = {};

try {
	const saved = localStorage.getItem("courses");
	if (!saved) localStorage.setItem("courses", JSON.stringify(initialCourses));
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

function getTimes(courses) {
	const times = [];
	function addTime(time) {
		if (!times.includes(time)) times.push(time);
	}
	for (const courseName in courses) {
		const course = courses[courseName];
		for (const day in course) {
			addTime(course[day].start);
			addTime(course[day].end);
		}
	}
	return times
		.map(normalizeTime)
		.map(timeToNumber)
		.sort((a, b) => a - b)
		.map(numberToTime);
}

let times = getTimes(courses);

// console.log(times);

function normalizeTime(time) {
	return {
		hours: Number(time.split(":")[0]),
		minutes: Number(time.split(":")[1]),
	};
}

function denormalizeTime(time) {
	return `${time.hours.toString().padStart(2, "0")}:${time.minutes
		.toString()
		.padStart(2, "0")}`;
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

let courseColors = generateDistinctColors(Object.keys(courses).length);

// COLORS ^^

function generateSchedule() {
	const table = document.createElement("div");

	table.classList.add("table");

	const percentileTimes = timesToPercentile(times);

	// Time Marks
	for (let i = 0; i < times.length; i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		row.style.position = "absolute";
		row.style.top = `${percentileTimes[i]}%`;
		row.style.left = "0"; // <-- was "-3rem"
		row.style.width = "100%";
		table.appendChild(row);

		const cell = document.createElement("div");
		cell.classList.add("cell");
		// pad minutes to 2 digits
		const h = times[i].hours.toString().padStart(2, "0");
		const m = times[i].minutes.toString().padStart(2, "0");
		cell.textContent = `${h}:${m}`;
		// place the label into the left gutter
		cell.style.position = "absolute";
		cell.style.left = `calc(-1 * var(--time-col) + 0.25rem)`;
		row.appendChild(cell);

		if (i == 0 || i == times.length - 1) continue;

		const line = document.createElement("div");
		line.classList.add("hline");
		line.style.position = "relative";
		line.style.left = "0"; // <-- was "3rem"
		line.style.top = "0";
		row.appendChild(line);
	}

	// Days

	for (let i = 0; i < days.length; i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		row.style.position = "absolute";
		row.style.top = "0";
		row.style.height = "100%";
		row.style.left = `calc(${(i * 100) / days.length}% )`; // <-- remove "+ 2rem"
		table.appendChild(row);

		const cell = document.createElement("div");
		cell.classList.add("cell");
		cell.textContent = days[i].slice(0, 1).toUpperCase() + days[i].slice(1);
		cell.style.position = "absolute";
		// put day labels in the top gutter, centered over each column
		cell.style.top = `calc(-1 * var(--day-head) + 0.25rem)`;
		cell.style.left = `calc(${(i * 100) / days.length}% + ${
			50 / days.length
		}% - 1.5ch)`;
		row.appendChild(cell);

		if (i == days.length) continue;

		const line = document.createElement("div");
		line.classList.add("vline");
		line.style.position = "relative";
		line.style.left = "0"; // <-- was "4rem"
		line.style.top = "-1rem";
		row.appendChild(line);
	}

	// Courses

	for (const courseName in courses) {
		const course = courses[courseName];

		for (const day in course) {
			const courseTime = course[day];

			const courseTimeStart = times.findIndex(
				(time) => denormalizeTime(time) == courseTime.start
			);
			const courseTimeEnd = times.findIndex(
				(time) => denormalizeTime(time) == courseTime.end
			);

			const courseTimeStartPercentile = parseFloat(
				timesToPercentile(times)[courseTimeStart]
			);
			const courseTimeEndPercentile = parseFloat(
				timesToPercentile(times)[courseTimeEnd]
			);

			const courseDayIndex = days.findIndex((currday) => currday == day);
			const courseDayPercentile = (courseDayIndex * 100) / days.length; // <-- no "- 1"
			const courseWidth = 100 / days.length;
			const courseHeight =
				courseTimeEndPercentile - courseTimeStartPercentile;

			const courseDiv = document.createElement("div");
			courseDiv.classList.add("course", toValidClassName(courseName));
			courseDiv.style.position = "absolute";
			courseDiv.style.top = `${courseTimeStartPercentile}%`;
			courseDiv.style.left = `${courseDayPercentile}%`;
			courseDiv.style.width = `${courseWidth}%`;
			courseDiv.style.height = `${courseHeight}%`;
			courseDiv.style.backgroundColor =
				courseColors[Object.keys(courses).indexOf(courseName)];
			courseDiv.style.borderRadius = "10px";
			const courseNameDiv = document.createElement("div");
			courseNameDiv.textContent = courseName;
			courseDiv.appendChild(courseNameDiv);
			// console.log(course[day]);
			if (course[day].info) {
				const courseInfoDiv = document.createElement("div");
				courseInfoDiv.classList.add("info");
				courseInfoDiv.textContent = course[day].info;
				courseDiv.appendChild(courseInfoDiv);
			}
			table.appendChild(courseDiv);
		}
	}

	return table;
}

function generateAltSection() {
	// Toggles

	const toggles = document.createElement("div");
	toggles.classList.add("toggles");

	for (const courseName in courses) {
		const group = document.createElement("div");
		group.classList.add("group");

		const toggle = document.createElement("input");
		toggle.addEventListener("change", () => {
			const courseDivs = document.getElementsByClassName(
				toValidClassName(courseName)
			);
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
			// console.log("changed!");
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
	return alt;
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

function mountCourseForm() {
	const host = document.createElement("div");
	host.className = "course-form";
	host.style.marginTop = "1rem";
	host.style.padding = "0.75rem";
	host.style.border = "1px solid #ddd";
	host.style.borderRadius = "8px";
	host.style.maxWidth = "640px";
	host.style.width = "100%";
	host.style.fontFamily = "system-ui, sans-serif";

	function makeCourseForm(courses) {
		const host = document.createElement("details");
		host.className = "course-form";

		// Summary
		const formSummary = document.createElement("summary");

		// Title
		const h3 = document.createElement("h3");
		h3.textContent = "Add / Edit Course";
		h3.style.margin = "0 0 1rem 0";
		formSummary.appendChild(h3);

		// Icon

		const icon = document.createElement("span");
		icon.className = "icon";
		icon.textContent = "➕";
		formSummary.appendChild(icon);

		host.appendChild(formSummary);

		// Row: label + input
		const nameRow = document.createElement("div");
		Object.assign(nameRow.style, {
			display: "flex",
			gap: ".5rem",
			alignItems: "center",
			flexWrap: "wrap",
		});

		const nameLabel = makeLegendFieldset("Course name");

		const rawNameInput = document.createElement("input");
		rawNameInput.id = "cf-name";
		rawNameInput.type = "text";
		rawNameInput.placeholder = "e.g. Metafisica";
		Object.assign(rawNameInput.style, {
			flex: "1",
			padding: ".4rem .6rem",
			border: "1px solid #ccc",
			borderRadius: "6px",
			width: "100%",
			textAlign: "left",
		});

		nameLabel.appendChild(rawNameInput);
		nameLabel.style.width = "100%";
		nameLabel.style.display = "flex";
		nameRow.appendChild(nameLabel);
		host.appendChild(nameRow);

		// Container for dynamic rows
		const rows = document.createElement("div");
		rows.id = "cf-rows";
		Object.assign(rows.style, {
			marginTop: ".75rem",
			display: "grid",
			gap: ".5rem",
		});
		host.appendChild(rows);

		// Row of buttons + select
		const controlsRow = document.createElement("div");
		Object.assign(controlsRow.style, {
			display: "flex",
			gap: ".5rem",
			marginTop: ".5rem",
		});

		const btnAdd = document.createElement("button");
		btnAdd.id = "cf-add-row";
		btnAdd.type = "button";
		btnAdd.textContent = "+ Add day/time";

		const btnClear = document.createElement("button");
		btnClear.id = "cf-clear-rows";
		btnClear.type = "button";
		btnClear.textContent = "Clear rows";

		const btnFill = document.createElement("button");
		btnFill.id = "cf-fill-existing";
		btnFill.type = "button";
		btnFill.title = "Load an existing course into the form";
		btnFill.textContent = "Load existing";

		const selectExisting = document.createElement("select");
		selectExisting.id = "cf-existing";
		selectExisting.style.marginLeft = "auto";

		const optDefault = document.createElement("option");
		optDefault.value = "";
		optDefault.textContent = "— Existing courses —";
		selectExisting.appendChild(optDefault);

		Object.keys(courses).forEach((c) => {
			const opt = document.createElement("option");
			opt.value = c;
			opt.textContent = c;
			selectExisting.appendChild(opt);
		});

		controlsRow.append(btnAdd, btnClear, btnFill, selectExisting);
		host.appendChild(controlsRow);

		// Row of save/delete
		const saveRow = document.createElement("div");
		Object.assign(saveRow.style, {
			display: "flex",
			gap: ".5rem",
			marginTop: ".75rem",
		});

		const btnSave = document.createElement("button");
		btnSave.id = "cf-save";
		btnSave.type = "button";
		btnSave.textContent = "Save course";
		Object.assign(btnSave.style, {
			background: "#111",
			color: "#fff",
			border: "none",
			padding: ".5rem .8rem",
			borderRadius: "6px",
		});

		const btnDelete = document.createElement("button");
		btnDelete.id = "cf-delete";
		btnDelete.type = "button";
		btnDelete.textContent = "Delete course";
		Object.assign(btnDelete.style, {
			marginLeft: "auto",
			color: "#b00020",
		});

		saveRow.append(btnSave, btnDelete);
		host.appendChild(saveRow);

		// Details block
		const details = document.createElement("details");
		details.style.marginTop = ".75rem";

		const summary = document.createElement("summary");
		summary.style.display = "default";
		summary.textContent = "Import / Export JSON";

		const exportRow = document.createElement("div");
		Object.assign(exportRow.style, {
			display: "flex",
			gap: ".5rem",
			marginTop: ".5rem",
		});

		const btnExport = document.createElement("button");
		btnExport.id = "cf-export";
		btnExport.type = "button";
		btnExport.textContent = "Export";

		const btnImport = document.createElement("button");
		btnImport.id = "cf-import";
		btnImport.type = "button";
		btnImport.textContent = "Import";

		exportRow.append(btnExport, btnImport);

		const textarea = document.createElement("textarea");
		textarea.id = "cf-json";
		textarea.rows = 6;
		Object.assign(textarea.style, {
			width: "100%",
			marginTop: ".5rem",
			fontFamily: "monospace",
		});

		details.append(summary, exportRow, textarea);
		host.appendChild(details);

		return host;
	}

	host.appendChild(makeCourseForm(courses));

	const rowsHost = host.querySelector("#cf-rows");
	const nameInput = host.querySelector("#cf-name");
	const existingSelect = host.querySelector("#cf-existing");

	function makeSelect(options, names, value) {
		const sel = document.createElement("select");
		sel.innerHTML = options
			.map((v, i) => `<option value="${v}">${names[i]}</option>`)
			.join("");
		if (value) sel.value = value;
		sel.style.padding = ".3rem .5rem";
		sel.style.border = "1px solid #ccc";
		sel.style.borderRadius = "6px";
		return sel;
	}

	let __timeInputCounter = 0;

	// tiny util
	const pad2 = (n) => String(n).padStart(2, "0");

	function makeLegendFieldset(name) {
		// container
		const fs = document.createElement("fieldset");
		fs.className = "time-input inline";
		fs.role = "group";
		fs.ariaLabel = name;

		// legend
		const l = document.createElement("legend");
		l.textContent = name.slice(0, 1).toUpperCase() + name.slice(1);

		fs.appendChild(l);

		return fs;
	}

	function makeTimeInput(
		hourOptions = [],
		minuteOptions = ["00", "15", "30", "45"],
		hourPlaceholder = "08",
		minutePlaceholder = "30",
		name = "time",
		hourValue,
		minuteValue
	) {
		const uid = `${name}-${__timeInputCounter++}`;

		const fs = makeLegendFieldset(name);

		// labels
		const lh = document.createElement("label");
		lh.setAttribute("for", `${uid}-hour`);
		lh.textContent = "Hour";
		lh.style.display = "none"; // visually hidden; keep for a11y

		const lm = document.createElement("label");
		lm.setAttribute("for", `${uid}-minute`);
		lm.textContent = "Minute";
		lm.style.display = "none";

		// inputs (text + inputmode so mobile shows numeric keypad)
		const hour = document.createElement("input");
		hour.type = "text";
		hour.id = `${uid}-hour`;
		hour.inputMode = "numeric";
		hour.autocomplete = "off";
		hour.maxLength = 2;
		hour.pattern = "^(0\\d|1\\d|2[0-3])$"; // 00-23
		hour.placeholder = pad2(hourPlaceholder);
		if (hourValue) hour.value = hourValue;

		const minute = document.createElement("input");
		minute.type = "text";
		minute.id = `${uid}-minute`;
		minute.inputMode = "numeric";
		minute.autocomplete = "off";
		minute.maxLength = 2;
		// 00,15,30,45 (change if you want any minute: ^([0-5]\\d)$)
		minute.pattern = "^(00|15|30|45)$";
		minute.placeholder = pad2(minutePlaceholder);
		if (minuteValue) minute.value = minuteValue;

		// datalists (optional hints)
		const hourListId = `${uid}-houropts`;
		const minListId = `${uid}-minuteopts`;
		const hourDL = document.createElement("datalist");
		hourDL.id = hourListId;
		hourDL.innerHTML = Array.from(new Set(hourOptions))
			.sort((a, b) => a - b)
			.map((h) => `<option value="${pad2(h)}"></option>`)
			.join("");

		const minDL = document.createElement("datalist");
		minDL.id = minListId;
		minDL.innerHTML = minuteOptions
			.map((m) => `<option value="${pad2(m)}"></option>`)
			.join("");

		hour.setAttribute("list", hourListId);
		minute.setAttribute("list", minListId);

		// normalize & validate on blur
		function clampHour() {
			const v = hour.value.replace(/\D/g, "");
			const n = Math.max(0, Math.min(23, Number(v)));
			hour.value = pad2(isFinite(n) ? n : 0);
		}
		function snapMinute() {
			let v = minute.value.replace(/\D/g, "");
			if (!v) v = "0";
			let n = Math.max(0, Math.min(59, Number(v)));
			// snap to nearest 15
			n = Math.round(n / 15) * 15;
			if (n === 60) n = 45;
			minute.value = pad2(n);
		}
		hour.addEventListener("blur", clampHour);
		minute.addEventListener("blur", snapMinute);

		// expose a helper to get/set combined value
		fs.getValue = () => `${pad2(hour.value)}:${pad2(minute.value)}`;
		fs.setValue = (hhmm) => {
			const [h, m] = (hhmm || "").split(":");
			if (h != null) hour.value = pad2(h);
			if (m != null) minute.value = pad2(m);
		};

		// layout (simple inline)
		const colon = document.createElement("span");
		colon.textContent = " : ";
		colon.ariaHidden = "true";
		colon.style.padding = "0 .25rem";

		fs.appendChild(lh);
		fs.appendChild(hourDL);
		fs.appendChild(hour);
		fs.appendChild(colon);
		fs.appendChild(lm);
		fs.appendChild(minDL);
		fs.appendChild(minute);

		return fs;
	}

	function addRow(
		init = { day: days[0], start: null, end: null, info: null }
	) {
		const row = document.createElement("div");
		row.style.display = "grid";
		row.style.gridTemplateColumns = "120px 1fr 1fr 1fr auto";
		row.style.alignItems = "center";
		row.style.gap = ".5rem";

		const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => {
			// console.log(days[i], d, days, i);
			return `${
				days[i].slice(0, 1).toUpperCase() + days[i].slice(1)
			} / ${d}`;
		});

		const daySel = makeLegendFieldset("Day");
		daySel.appendChild(makeSelect(days, dayNames, init.day));

		const hourOptions = Array.from(
			new Set(times.map((t) => pad2(String(t.hours))))
		);
		const minuteOptions = ["00", "15", "30", "45"];

		const startInput = makeTimeInput(
			hourOptions,
			minuteOptions,
			"08",
			"30",
			"start",
			init.start ? pad2(String(init.start.hours)) : null,
			init.start ? pad2(String(init.start.minutes)) : null
		);
		const endInput = makeTimeInput(
			hourOptions,
			minuteOptions,
			"10",
			"00",
			"end",
			init.end ? pad2(String(init.end.hours)) : null,
			init.end ? pad2(String(init.end.minutes)) : null
		);

		const infoInput = makeLegendFieldset("Info / Room");
		const rawInfoInput = document.createElement("input");
		rawInfoInput.type = "text";
		rawInfoInput.placeholder = "Info";
		rawInfoInput.style.padding = ".3rem .5rem";
		rawInfoInput.style.border = "1px solid #ccc";
		rawInfoInput.style.width = "100%";
		rawInfoInput.style.boxSizing = "border-box";
		rawInfoInput.style.textAlign = "left";
		rawInfoInput.style.borderRadius = "6px";

		if (init.info) rawInfoInput.value = init.info;

		infoInput.appendChild(rawInfoInput);

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
		row.appendChild(startInput);
		row.appendChild(endInput);
		row.appendChild(infoInput);
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
			addRow({
				day,
				start: normalizeTime(course[day].start),
				end: normalizeTime(course[day].end),
				info: course[day].info,
			});
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

		function inputsToTime(h, m) {
			const hour = String(h).padStart(2, "0");
			const minute = String(m).padStart(2, "0");
			return `${hour}:${minute}`;
		}

		// Build the course entry { day: {start, end}, ... }
		const entry = {};
		for (const row of rows) {
			const daySel = row.querySelector("select");
			const [startSelHour, startSelMin, endSelHour, endSelMin, infoElem] =
				row.querySelectorAll("fieldset input");

			const day = daySel.value;
			const start = inputsToTime(startSelHour.value, startSelMin.value);
			const end = inputsToTime(endSelHour.value, endSelMin.value);

			// Validate time order
			if (timeToNumber(start) >= timeToNumber(end)) {
				alert(`End must be after start for ${day}.`);
				return;
			}

			const info = infoElem.value;

			entry[day] = { start, end, info };
		}

		// Merge into courses
		courses[name] = entry;

		times = getTimes(courses);

		// Persist (optional)
		try {
			localStorage.setItem("courses", JSON.stringify(courses));
		} catch {}

		// Re-render schedule + conflicts
		rerenderSchedule();
	});

	host.querySelector("#cf-delete").addEventListener("click", () => {
		const name = nameInput.value.trim();
		if (!name) {
			alert("Course not entered.");
			return;
		}
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
	try {
		const saved = localStorage.getItem("courses");
		if (saved) {
			const parsed = JSON.parse(saved);
			if (parsed && typeof parsed === "object")
				Object.assign(courses, parsed);
		}
	} catch {}

	return host;
}

function toValidClassName(str) {
	return str.replace(/[^a-zA-Z0-9]/g, "-");
}

function fromValidClassName(str) {
	return str.replace(/-/g, " ");
}

function rerenderSchedule() {
	courseColors = generateDistinctColors(Object.keys(courses).length);

	// remove previous render
	document
		.querySelectorAll("main, .table, .alt")
		.forEach((el) => el.remove());

	// re-run your schedule + conflicts
	render();
	if (typeof updateConflicts === "function") updateConflicts();
}

function render() {
	const main = document.createElement("main");
	const schedule = generateSchedule();
	const alt = generateAltSection();
	const form = mountCourseForm();

	const title = document.createElement("h1");
	title.textContent = "My Schedule 🗓️";

	main.append(title, schedule, form);
	body.append(main, alt);
}

render();
updateConflicts();
