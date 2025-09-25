// Booking Widget Script
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('booking-widget-container');
    if (!container) return;

    // Laad de CSS stijlen
    const style = document.createElement('style');
    style.textContent = `
        .booking-widget {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
            color: #333;
        }

        .widget-header {
            background: linear-gradient(135deg, #ff0000 0%, #990000 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .widget-header h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .widget-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .widget-content {
            padding: 40px;
        }

        .calendar-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .calendar-title {
            font-size: 1.5rem;
            font-weight: 600;
        }

        .calendar-nav {
            display: flex;
            gap: 10px;
        }

        .calendar-nav button {
            background: #f0f0f0;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .calendar-nav button:hover {
            background: #e0e0e0;
        }

        .calendar-days {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            overflow-x: auto;
            padding-bottom: 10px;
        }

        .day-item {
            min-width: 80px;
            padding: 10px;
            border-radius: 10px;
            background: #f5f5f5;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .day-item.active {
            background: #ff0000;
            color: white;
        }

        .day-name {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .day-date {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .class-list {
            display: grid;
            gap: 15px;
        }

        .class-item {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s;
            border-left: 4px solid #ff0000;
        }

        .class-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .class-info {
            flex: 1;
        }

        .class-name {
            font-weight: 600;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }

        .class-details {
            display: flex;
            gap: 15px;
            font-size: 0.9rem;
            color: #666;
        }

        .class-detail {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .class-action button {
            background: #ff0000;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .class-action button:hover {
            background: #cc0000;
        }

        .class-action button:disabled {
            background: #cccccc;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .class-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }

            .class-action {
                width: 100%;
            }

            .class-action button {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);

    // Haal lessen op uit localStorage
    function getClasses() {
        try {
            const storedClasses = localStorage.getItem('rebelsClasses');
            return storedClasses ? JSON.parse(storedClasses) : [];
        } catch (error) {
            console.error("Failed to parse classes from localStorage", error);
            return [];
        }
    }

    // Maak de widget HTML structuur
    container.innerHTML = `
        <div class="booking-widget">
            <div class="widget-header">
                <h2>Groepslessen Rooster</h2>
                <p>Bekijk en reserveer je favoriete lessen</p>
            </div>
            <div class="widget-content">
                <div class="calendar-controls">
                    <div class="calendar-title">Deze Week</div>
                    <div class="calendar-nav">
                        <button id="prev-week">←</button>
                        <button id="next-week">→</button>
                    </div>
                </div>
                <div class="calendar-days" id="calendar-days"></div>
                <div class="class-list" id="class-list"></div>
            </div>
        </div>
    `;

    // Initialiseer de kalender
    const today = new Date();
    let currentDate = new Date(today);
    let selectedDay = today.getDay() === 0 ? 7 : today.getDay(); // Zondag is 7 in plaats van 0

    // Genereer de dagen van de week
    function generateCalendarDays() {
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';

        // Bereken de eerste dag van de week (maandag)
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = currentDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Maandag is de eerste dag
        startOfWeek.setDate(currentDate.getDate() + diff);

        // Genereer de 7 dagen van de week
        const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dayItem = document.createElement('div');
            dayItem.className = `day-item ${(i + 1) === selectedDay ? 'active' : ''}`;
            dayItem.dataset.day = i + 1;
            dayItem.dataset.date = date.toISOString().split('T')[0];
            
            dayItem.innerHTML = `
                <div class="day-name">${dayNames[i]}</div>
                <div class="day-date">${date.getDate()}/${date.getMonth() + 1}</div>
            `;
            
            dayItem.addEventListener('click', () => {
                document.querySelectorAll('.day-item').forEach(item => item.classList.remove('active'));
                dayItem.classList.add('active');
                selectedDay = parseInt(dayItem.dataset.day);
                renderClasses();
            });
            
            daysContainer.appendChild(dayItem);
        }
    }

    // Render de lessen voor de geselecteerde dag (alleen specifieke datums)
    function renderClasses() {
        const classesList = document.getElementById('class-list');
        classesList.innerHTML = '';
        
        const classes = getClasses();
        
        // Bereken de geselecteerde datum
        const selectedDate = new Date(currentDate);
        const startOfWeek = new Date(selectedDate);
        const dayOfWeek = selectedDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(selectedDate.getDate() + diff);
        
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + (selectedDay - 1));
        const dateString = targetDate.toISOString().split('T')[0];
        
        // Filter ALLEEN lessen met specifieke datum die overeenkomt met de geselecteerde datum
        const filteredClasses = classes.filter(c => {
            // Controleer of de les een specifieke datum heeft die overeenkomt met de geselecteerde datum
            if (c.specific_date === dateString || c.date === dateString) {
                return true;
            }
            // Als de les een specific_date heeft, controleer of de datum op de juiste dag valt
            if (c.specific_date || c.date) {
                const lessonDate = new Date(c.specific_date || c.date);
                const lessonDayOfWeek = lessonDate.getDay();
                const adjustedDay = lessonDayOfWeek === 0 ? 7 : lessonDayOfWeek; // Zondag = 7 in plaats van 0
                return adjustedDay === selectedDay && (c.specific_date === dateString || c.date === dateString);
            }
            return false;
        });
        
        if (filteredClasses.length === 0) {
            classesList.innerHTML = '<div class="text-center py-10 text-gray-500">Geen lessen gevonden voor deze dag</div>';
            return;
        }
        
        // Sorteer lessen op tijd
        filteredClasses.sort((a, b) => {
            const timeA = a.time.split(' - ')[0];
            const timeB = b.time.split(' - ')[0];
            return timeA.localeCompare(timeB);
        });
        
        filteredClasses.forEach(cls => {
            const classItem = document.createElement('div');
            classItem.className = 'class-item';
            
            classItem.innerHTML = `
                <div class="class-info">
                    <div class="class-name">${cls.title || cls.name}</div>
                    <div class="class-details">
                        <div class="class-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${cls.time}
                        </div>
                        <div class="class-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            ${cls.trainer}
                        </div>
                        <div class="class-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            ${cls.spots} plekken
                        </div>
                        ${cls.description ? `<div class="class-detail class-description" style="margin-top: 8px; font-style: italic; color: #888;">${cls.description}</div>` : ''}
                    </div>
                </div>
                <div class="class-action">
                    <button ${cls.spots <= 0 ? 'disabled' : ''} data-id="${cls.id}">
                        ${cls.spots <= 0 ? 'Vol' : 'Reserveer'}
                    </button>
                </div>
            `;
            
            // Voeg event listener toe voor reserveren
            const reserveButton = classItem.querySelector('button');
            if (!reserveButton.disabled) {
                reserveButton.addEventListener('click', () => {
                    reserveClass(cls.id);
                });
            }
            
            classesList.appendChild(classItem);
        });
    }

    // Functie om een les te reserveren
    function reserveClass(classId) {
        const classes = getClasses();
        const updatedClasses = classes.map(cls => {
            if (cls.id === classId && cls.spots > 0) {
                return { ...cls, spots: cls.spots - 1 };
            }
            return cls;
        });
        
        localStorage.setItem('rebelsClasses', JSON.stringify(updatedClasses));
        
        // Toon bevestiging
        alert('Je hebt succesvol gereserveerd!');
        
        // Update de weergave
        renderClasses();
    }

    // Event listeners voor navigatie
    document.getElementById('prev-week').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        generateCalendarDays();
        renderClasses();
    });

    document.getElementById('next-week').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        generateCalendarDays();
        renderClasses();
    });

    // Initialiseer de widget
    generateCalendarDays();
    renderClasses();
});