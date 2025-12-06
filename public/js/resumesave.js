function addEducation() {
    const section = document.getElementById("education-section");
    const index = section.querySelectorAll(".item").length;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">X</button>
    <input type="text" name="education[${index}][institution]" placeholder="Institution" />
    <input type="text" name="education[${index}][degree]" placeholder="Degree" />
    <input type="text" name="education[${index}][startYear]" placeholder="Start Year" />
    <input type="text" name="education[${index}][endYear]" placeholder="End Year" />
    `;
    section.appendChild(div);
}

function addExperience() {
    const section = document.getElementById("experience-section");
    const index = section.querySelectorAll(".item").length;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">X</button>
    <input type="text" name="experience[${index}][company]" placeholder="Company" />
    <input type="text" name="experience[${index}][role]" placeholder="Role" />
    <input type="text" name="experience[${index}][startDate]" placeholder="Start Date" />
    <input type="text" name="experience[${index}][endDate]" placeholder="End Date" />
    <textarea name="experience[${index}][description]" rows="2" placeholder="Description"></textarea>
    `;
    section.appendChild(div);
}

function addSkill() {
    const section = document.getElementById("skills-list");
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">X</button>
    <input type="text" name="skills[]" placeholder="Skill" />
    `;
    section.appendChild(div);
}

function addProject() {
    const section = document.getElementById("projects-section");
    const index = section.querySelectorAll(".item").length;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">X</button>
    <input type="text" name="projects[${index}][title]" placeholder="Project Title" />
    <textarea name="projects[${index}][description]" rows="2" placeholder="Description"></textarea>
    <input type="text" name="projects[${index}][technologies]" placeholder="Technologies (comma separated)" />
    `;
    section.appendChild(div);
}