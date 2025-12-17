// Автозаполнение регионов
$.get('/api/regions', regions => {
    $('#regionInput').autocomplete({
        source: regions
    });
});

// Автозаполнение остановок по региону
$('#regionInput').on('change', function () {
    const region = $(this).val();

    // Загружаем остановки выбранного региона
    $.get('/api/stops', { region }, stops => {
        // Получаем уникальные stop_name
        const stopNames = [...new Set(stops.map(s => s.stop_name))];

        $('#stopInput').autocomplete({
            source: stopNames,
            select: function(event, ui) {
                // Сохраняем объект выбранной остановки
                selectedStop = stops.find(s => s.stop_name === ui.item.value);
            }
        });

        // Сбрасываем выбранную остановку при смене региона
        selectedStop = null;
        $('#stopInput').val('');
        $('#busList').empty();
        $('#busTimes').empty();
    });
});

// Поиск автобусов по остановке
$('#searchBuses').on('click', function () {
    if (!selectedStop) {
        alert('Please select a bus stop from the list');
        return;
    }

    const stop = selectedStop;

    // Загружаем автобусы для остановки
    $.get('/api/buses', { stopId: stop.stop_id }, buses => {
        $('#busList').empty();
        $('#busTimes').empty();

        if (buses.length === 0) {
            $('#busList').text('No buses found for this stop');
            return;
        }

        buses.forEach(bus => {
            const btn = $('<button>')
                .addClass('btn btn-outline-primary m-1')
                .text(bus);

            // При клике загружаем время прибытия
            btn.on('click', () => loadBusTimes(stop.stop_id, bus));

            $('#busList').append(btn);
        });
    });
});

// Загрузка времени прибытия автобуса
function loadBusTimes(stopId, busName) {
    $.get('/api/bus-times', { stopId, busName }, times => {
        $('#busTimes').empty();

        if (!times || times.length === 0) {
            $('#busTimes').text('No upcoming arrivals');
            return;
        }

        const list = $('<ul>');

        // Выводим 5 ближайших прибытия
        times.forEach(t => {
            list.append(`
                <li>
                    <strong>${t.arrival_time}</strong>
                    — direction: ${t.headsign}
                </li>
            `);
        });

        $('#busTimes').append('<h5>Next arrivals</h5>');
        $('#busTimes').append(list);

        // Предупреждение о следующем дне
        $('#busTimes').append(
            '<div class="text-muted mt-2">⚠ Arrival time may refer to the next day</div>'
        );
    });
}

// Поиск ближайшей остановки по геолокации
$('#findNearest').on('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            $.ajax({
                url: '/api/nearest-stop',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ lat: latitude, lon: longitude }),
                success: stop => {
                    if (!stop) return alert('No stop found nearby');

                    // Устанавливаем регион
                    $('#regionInput').val(stop.stop_area).trigger('change');

                    // Ждём немного, чтобы автозаполнение остановок успело загрузиться
                    setTimeout(() => {
                        $('#stopInput').val(stop.stop_name);
                        selectedStop = stop;

                        // Загружаем автобусы
                        $('#searchBuses').click();
                    }, 300); // 300ms должно быть достаточно
                },
                error: err => {
                    console.error(err);
                    alert('Failed to find nearest stop');
                }
            });

        }, () => alert('Cannot get your location'));
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Очистка выбора
$('#clearSelection').on('click', () => {
    selectedStop = null;
    $('#regionInput').val('');
    $('#stopInput').val('');
    $('#busList').empty();
    $('#busTimes').empty();
});
