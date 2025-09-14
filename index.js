const body = document.querySelector("body");

const courses = {
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
		conflictDiv.textContent = conflict.join(", ");
		conflictsDiv.appendChild(conflictDiv);
	});

	const alt = document.createElement("div");
	alt.classList.add("alt");
	alt.appendChild(toggles);
	alt.appendChild(conflictsDiv);
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

	const checkRepetition = (combination) => {
		for (let i = 0; i < combinations.length; i++) {
            const currentCheck = combinations[i];
            const repeated = currentCheck.every((course, index) => {
                if (course === combination[index]) {
                    return true;
                }
                return false;
            })
            if (repeated) {
                return true;
            }
		}
		return false;
	};

	const checkConflicts = (combination, newCourseName) => {
		for (let i = 0; i < combination.length; i++) {
			const currentConflict = [combination[i], newCourseName];
			if (
				conflicts.some(
					(conflict) =>
						conflict.includes(currentConflict[0]) &&
						conflict.includes(currentConflict[1])
				)
			) {
				return true;
			}
		}
		return false;
	};

	const backtrack = (combination, index) => {
		if (index === courseAmount) {
			const normalizedCombination = [
				...combination.sort((a, b) => {
					if (a < b) {
						return -1;
					}
					if (a > b) {
						return 1;
					}
					return 0;
				}),
			];

			if (!checkRepetition(normalizedCombination)) {
				combinations.push(normalizedCombination);
			}
			return;
		}

		for (let i = 0; i < courseNames.length; i++) {
			const courseName = courseNames[i];

			if (
				!combination.includes(courseName) &&
				!checkConflicts(combination, courseName)
			) {
				combination.push(courseName);
				backtrack(combination, index + 1);
				combination.pop();
			}
		}
	};

	backtrack([], 0);
	return combinations;
}

body.innerHTML = findAllCombinations(courses)
	.map((c) => c.join("-"))
	.join(" <br> ");
drawSchedule();
updateConflicts();
