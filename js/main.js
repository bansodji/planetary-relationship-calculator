$(document).ready(function () {

    const temp_friendship_positions = [2, 3, 4, 10, 11, 12];
    let temp_relationship = {};
    let compound_relationship = {};
    const planets = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

    let PNR = null;     // PNR = Planatery Natural Relation

    let planetaryPositions = {};


    // ========================================================================================= //
    // ================ Fetching form data start ==============================================//
    // fetching json data - planatery natural relationship data
    fetch("./assets/planetary_natural_relation.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load JSON file");
            }

            return response.json();
        })
        .then(data => {
            PNR = data;

            // console.log("PNR:", PNR);
            console.log("success");
        })
        .catch(error => {
            console.error("Error:", error);
        });


    // Main Form Submit
    $("#MainForm").on("submit", function (e) {
        e.preventDefault();

        if (!PNR) {
            console.log("Planetary relationship data is still loading...");
            return;
        }

        let formData = $(this).serializeArray();

        formData.forEach(function (item) {
            planetaryPositions[item.name] = Number(item.value);
        });

        // =================== Fetching form data end ==============================================//
        // ========================================================================================= //


        // ========================================================================================= //
        // ==================== Compound relationship calculation start ============================ //

        for (let i = 0; i < planets.length; i++) {
            let friend = [];
            let enemy = [];

            let c_friend = [];
            let cg_friend = [];
            let c_enemy = [];
            let ce_enemy = [];
            let c_neutral = [];

            let currPlanet = planets[i];
            let currPlanetPosition = planetaryPositions[currPlanet];
            console.log("current planet: ", currPlanet, ": ", currPlanetPosition);

            planets.forEach(function (item) {
                if (currPlanet != item) {
                    // console.log(item, ": ", planetaryPositions[item]);

                    let count = 1;
                    let run = currPlanetPosition;

                    while (run != planetaryPositions[item]) {
                        run++;
                        count++;
                        (run == 13) ? run = 1 : "";
                    }
                    console.log(item, "rashi no. : ", run);
                    console.log(item, "position no. : ", count);

                    // friend
                    if (temp_friendship_positions.includes(count)) {
                        friend.push(item);

                        if (PNR[currPlanet].friend.includes(item)) {        // f+f = gf
                            cg_friend.push(item);
                        }
                        else if (PNR[currPlanet].enemy.includes(item)) {        // f+e = n
                            c_neutral.push(item);
                        }
                        else if (PNR[currPlanet].neutral.includes(item)) {        // f+n = f
                            c_friend.push(item);
                        }

                    }
                    // enemy
                    else {
                        enemy.push(item);

                        if (PNR[currPlanet].enemy.includes(item)) {        // e+e = ee
                            ce_enemy.push(item);
                        }
                        else if (PNR[currPlanet].friend.includes(item)) {        // e+f = n
                            c_neutral.push(item);
                        }
                        else if (PNR[currPlanet].neutral.includes(item)) {        // e+n
                            c_enemy.push(item);
                        }
                    }


                }
            });

            temp_relationship[currPlanet] = {
                friend, enemy
            };

            compound_relationship[currPlanet] = {
                friend: c_friend,
                greatFriend: cg_friend,
                enemy: c_enemy,
                extremeEnemy: ce_enemy,
                neutral: c_neutral
            };

        }

        console.log(" ");

        // console.log("temp_relationship ");
        // console.log(temp_relationship);

        // console.log("compound_relationship ");
        // console.log(compound_relationship);

        // Generate temporary relationship table only if checkbox is checked
        if ($("#ShowTempRelationship").is(":checked")) {
            generateTempRelTable(temp_relationship);
        }
        else {
            $("#TempRelationshipTable").empty();
        }


        // Always generate compound relationship table
        generateCompRelTable(compound_relationship);

        // ================= Compound relationship calculation start =============================== //
        // ========================================================================================= //



    });

    $("#ClearButton").on("click", function () {
        $("#MainForm input").val("");

        planetaryPositions = {};
        temp_relationship = {};
        compound_relationship = {};
    });


    $("#GetNRButton").on("click", function () {
        if (PNR == null) {
            alert("Data Loading.....please try again");
        }
        else {
            getNRTable(PNR);
            showNaturalButton();
        }
    });

    $("#HideNRButton").on("click", function () {
        hideNaturalButton();
    });

    $("#ClearTableButton").on("click", function () {
        $("#NaturalRelationshipTable").html("");
        $("#TempRelationshipTable").html("");
        $("#CompRelationshipTable").html("");

        hideNaturalButton();
    });

});

function hideNaturalButton() {
    $("#HideNRButton").addClass("d-none");
    $("#HideNRButton").removeClass("d-inline");
    $("#GetNRButton").removeClass("d-none");
    $("#NaturalRelationshipTable").html("");
}

function showNaturalButton() {
    $("#HideNRButton").addClass("d-inline");
    $("#HideNRButton").removeClass("d-none");
    $("#GetNRButton").addClass("d-none");
}

function getNRTable(PNR) {

    let table = `
        <h5 class="mb-3 text-center">Natural Planetary Relationship</h5>
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Planet</th>
                    <th>Friend</th>
                    <th>Neutral</th>
                    <th>Enemy</th>
                </tr>
            </thead>

            <tbody>
    `;

    for (let planet in PNR) {

        table += `
            <tr>
                <td>${formatPlanetName(planet)}</td>

                <td>
                    ${PNR[planet].friend
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${PNR[planet].neutral
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${PNR[planet].enemy
                .map(formatPlanetName)
                .join(", ")}
                </td>
            </tr>
        `;
    }

    table += `
            </tbody>
        </table>
    `;

    $("#NaturalRelationshipTable").html(table);
}

function generateCompRelTable(data) {

    let table = `
        <h5 class="mb-3 text-center">Compound Planetary Relationship</h5>

        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Planet</th>
                    <th>Friend</th>
                    <th>Great Friend</th>
                    <th>Neutral</th>
                    <th>Enemy</th>
                    <th>Extreme Enemy</th>
                </tr>
            </thead>

            <tbody>
    `;

    for (let planet in data) {

        table += `
            <tr>
                <td>${formatPlanetName(planet)}</td>

                <td>
                    ${data[planet].friend
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${data[planet].greatFriend
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${data[planet].neutral
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${data[planet].enemy
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${data[planet].extremeEnemy
                .map(formatPlanetName)
                .join(", ")}
                </td>
            </tr>
        `;
    }

    table += `
            </tbody>
        </table>
    `;

    $("#CompRelationshipTable").html(table);
}

function generateTempRelTable(data) {

    let table = `
        <h5 class="mb-3 text-center">Temporary Planetary Relationship</h5>

        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Planet</th>
                    <th>Friend</th>
                    <th>Enemy</th>
                </tr>
            </thead>

            <tbody>
    `;

    for (let planet in data) {

        table += `
            <tr>
                <td>${formatPlanetName(planet)}</td>

                <td>
                    ${data[planet].friend
                .map(formatPlanetName)
                .join(", ")}
                </td>

                <td>
                    ${data[planet].enemy
                .map(formatPlanetName)
                .join(", ")}
                </td>
            </tr>
        `;
    }

    table += `
            </tbody>
        </table>
    `;

    $("#TempRelationshipTable").html(table);
}

function formatPlanetName(planet) {

    return planet.charAt(0).toUpperCase() + planet.slice(1);

}