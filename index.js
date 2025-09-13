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
};

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

	const days = ["seg", "ter", "qua", "qui", "sex"];
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

        console.log(course)

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
			courseDiv.style.backgroundColor = courseColors[Object.keys(courses).indexOf(courseName)];
			courseDiv.style.borderRadius = "10px";
			courseDiv.textContent = courseName;
			table.appendChild(courseDiv);
		}
	}

	// Toggles

	const toggles = document.createElement("div");
	toggles.classList.add("toggles");

	for (const courseName in courses) {
		const course = courses[courseName];

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
		});
		toggle.type = "checkbox";
		toggle.checked = true;
		toggle.id = courseName;
		toggles.appendChild(toggle);

		const label = document.createElement("label");
		label.htmlFor = courseName;
		label.textContent = courseName;
		toggles.appendChild(label);
	}

	body.appendChild(toggles);
}

body.textContent = JSON.stringify(timesToPercentile(normalizedTimes), null, 2);

drawSchedule();
