$(document).ready(function () {

    init();

    function init() {
        var url = "https://api.covid19api.com/summary";

        $.get(url, function (data) {
            var totalCases = (data.Global.TotalConfirmed).toLocaleString();
            $(".global-data tr:first-child td:first-child").text(totalCases);
            var TotalRecovered = (data.Global.TotalRecovered).toLocaleString();
            $(".global-data tr:first-child td:nth-child(2)").text(TotalRecovered);
            var TotalDeaths = (data.Global.TotalDeaths).toLocaleString();
            $(".global-data tr:first-child td:nth-child(3)").text(TotalDeaths);

            var newCases = (data.Global.NewConfirmed).toLocaleString();
            $(".global-data tr:nth-child(2) td:first-child").text("+ " + newCases);
            var newRecovered = (data.Global.NewRecovered).toLocaleString();
            $(".global-data tr:nth-child(2) td:nth-child(2)").text("+ " + newRecovered);
            var newDeaths = (data.Global.NewDeaths).toLocaleString();
            $(".global-data tr:nth-child(2) td:nth-child(3)").text("+ " + newDeaths);

            $("#date").append(data.Global.Date);

            const length = data.Countries.length;

            // Convery json object to array. Since sort only works on array
            var dataArray = $.map(data.Countries, function (value) {
                return [value];
            });
            dataArray.sort((a, b) => {
                return b.TotalConfirmed - a.TotalConfirmed;
            });


            for (var i = 0; i < length; i++) {
                $('.country-data').append(
                    `<tr>
                        <td>${i+1}</td>
                        <td>${dataArray[i].Country}</td> 
                        <td>${dataArray[i].TotalConfirmed}</td>
                        <td>${dataArray[i].TotalRecovered}</td>
                        <td>${dataArray[i].TotalDeaths}</td>
                        <td>${dataArray[i].NewConfirmed}</td>
                        <td>${dataArray[i].NewRecovered}</td>
                        <td>${dataArray[i].NewDeaths}</td>
                    <tr>`
                )
            } // For country icon - <image src="./india.png" class="country-icon">
        })
    }

    $(".submit-pin").on("click", function () {
        // get date in dd-mm-yyyy format
        const selectedDate = $(".date").val();

        let dateArray = selectedDate.split("-");

        let date = "";
        for (var i = dateArray.length - 1; i >= 0; i--) {
            date = date + dateArray[i] + "-";
        }
        date = date.substring(0, date.length - 1);
        let pincode = $("#pincode").val();

        let url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + pincode + "&date=" + date;

        $.get(url, function (data) {

            $(".available-slots h2").html(`Slot Search Results <span id="no-of-centers">(${data.centers.length} Center(s) Found)</span>`);

            if (data.centers.length == 0) {
                $(".available-slots p").text("No Vaccination center is available for booking");
                $(".center-container").text("");
            } else {
                $(".available-slots p").text("");
                $(".center-container").text("");
                for (var i = 0; i < data.centers.length; i++) {

                    var slots = "";
                    for (var j = 0; j < data.centers[i].sessions.length; j++) {
                        if (data.centers[i].sessions[j].available_capacity > 0) {
                            var ageLimit = data.centers[i].sessions[j].min_age_limit;
                            if(ageLimit ==18){
                                ageLimit = "18 - 44"
                            }

                            slots += `
                            <div class='slot-container'>
                                <a href='#'>${data.centers[i].sessions[j].date}</a>
                                <p class="vaccine-name">${data.centers[i].sessions[j].vaccine}</p>
                                <p>Age Limit: ${ageLimit}</p>
                                <p>Dose 1: ${data.centers[i].sessions[j].available_capacity_dose1} | 
                                Dose 2: ${data.centers[i].sessions[j].available_capacity_dose2}</p>
                            </div>`
                        } else {
                            slots += `
                            <div class='slot-container'>
                                <a href='#'>${data.centers[i].sessions[j].date}</a>
                                <p class="vaccine-name">${data.centers[i].sessions[j].vaccine}</p>
                                <div class="booked">
                                    <span>Booked</span>
                                </div>
                            </div>`
                        }
                    }

                    var fees = "";
                    for (var k = 0; k < data.centers[i].vaccine_fees.length; k++) {
                        fees += `${data.centers[i].vaccine_fees[k].vaccine}: &#8377;${data.centers[i].vaccine_fees[k].fee} `;
                    }

                    $(".center-container").append(
                        `<tr>
                            <td class="center-left">
                                <h3>${data.centers[i].name} <span class="btn-primary-small">${data.centers[i].fee_type}</span></h3>
                                <p>${data.centers[i].address}</p>
                                <p>Timing: ${(data.centers[i].from).toString().substring(0,5)} to ${(data.centers[i].to).toString().substring(0, 5)}</p>
                                <p class="fees">${fees}</p>
                            </td>
                            <td>${slots}</td>
                        </tr>`
                    );
                }
            }
        });
    });
});