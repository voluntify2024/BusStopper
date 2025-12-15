// Получаем регионы для autocomplete
$.get('/api/regions', data => {
    $("#regionInput").autocomplete({ source: data });
});

// Автозаполнение остановок по региону
$('#regionInput').on('change', function() {
    const region = $(this).val();
    $.get('/api/stops', { region }, stops => {
        const stopNames = stops.map(s => s.stop_name);
        $("#stopInput").autocomplete({ source: stopNames });
    });
});

// Поиск автобусов
$('#searchBuses').on('click', function() {
    const stopName = $('#stopInput').val();
    $.get('/api/stops', { region: $('#regionInput').val() }, stops => {
        const stop = stops.find(s => s.stop_name === stopName);
        if (!stop) return alert("Stop not found");

        $.get('/api/buses', { stopId: stop.stop_id }, buses => {
            $('#busList').empty();
            buses.forEach(bus => {
                const btn = $('<button>').addClass('btn btn-secondary m-1').text(bus);
                btn.on('click', () => {
                    $.get('/api/bus-times', { stopId: stop.stop_id, busName: bus }, times => {
                        $('#busTimes').html('<h5>Next Arrivals:</h5><ul>' +
                            times.map(t => `<li>${t.arrival_time}</li>`).join('') + '</ul>');
                    });
                });
                $('#busList').append(btn);
            });
        });
    });
});
