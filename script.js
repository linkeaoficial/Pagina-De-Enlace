// Inicializar Iconos
        lucide.createIcons();

      /* --- LÓGICA PARA OCULTAR EL PRELOADER --- */
      window.addEventListener('load', () => {
          const preloader = document.getElementById('preloader');
          setTimeout(() => {
              if(preloader) preloader.classList.add('hide-loader');
              // ESTO ACTIVA LAS ANIMACIONES:
              document.body.classList.add('page-loaded');
          }, 800); 
      });

        // --- LÓGICA DEL VISOR DE FOTO ---
        const photoViewer = document.getElementById('photoViewer');

        function openPhotoViewer() {
            photoViewer.style.display = 'flex';
        }

        function closePhotoViewer() {
            photoViewer.style.opacity = '0';
            setTimeout(() => {
                photoViewer.style.display = 'none';
                photoViewer.style.opacity = '1';
            }, 300);
        }

        function goToSchedule() {
            closePhotoViewer();
            // Pequeña espera para que cierre el visor antes de cambiar la sección
            setTimeout(() => {
                switchView('schedule', document.getElementById('btn-home'));
            }, 350);
        }

        // Lógica de Cambio de Vistas
        function switchView(viewName, btnElement) {
            // 1. Ocultar todas las secciones
            document.querySelectorAll('.view-section').forEach(el => {
                el.classList.remove('active');
            });

            // 2. Mostrar la seleccionada
            // 2. Mostrar la seleccionada con efecto de reinicio de animaciones
            const target = document.getElementById('view-' + viewName);
            if(target) {
                target.classList.remove('active');
                // Forzamos el reinicio visual
                void target.offsetWidth; 
                target.classList.add('active');
            }

            // 3. Actualizar estado del Dock (si se presionó desde el dock o si volvemos a home)
            if(btnElement) {
                document.querySelectorAll('.dock-item').forEach(btn => btn.classList.remove('active'));
                btnElement.classList.add('active');
            }
        }

        // Lógica Modo Oscuro
        const themeBtn = document.getElementById('themeToggle');
        const sunIcon = document.querySelector('.icon-sun');
        const moonIcon = document.querySelector('.icon-moon');
        const body = document.body;

        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            if(body.classList.contains('dark-mode')) {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
                themeBtn.style.color = '#fbbf24';
            } else {
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
                themeBtn.style.color = 'var(--text-main)';
            }
        });

        function shareProfile() {
            const shareData = {
                title: 'Perfil Dra. Lina',
                text: 'Agenda tu cita de medicina estética aquí.',
                url: window.location.href
            };
            if (navigator.share) {
                navigator.share(shareData).catch(err => console.log('Error sharing', err));
            } else {
                alert('¡Enlace copiado!');
            }
        }

        // --- SISTEMA DE RESERVAS (Lógica Robusta) ---
        let currDate = new Date();
        let selectedDate = null;

        // --- LÓGICA DEL SELECTOR PERSONALIZADO ---
        let selectedTime = null; // Variable para guardar la hora elegida

        function renderTimeOptions() {
            const container = document.getElementById('customOptionsList');
            container.innerHTML = '';
            
            const ranges = [
                { start: 8, end: 12 }, 
                { start: 14, end: 18 } 
            ];

            ranges.forEach(range => {
                for (let hour = range.start; hour < range.end; hour++) {
                    addCustomOption(container, hour, '00');
                    addCustomOption(container, hour, '30');
                }
            });
        }

        function addCustomOption(container, hour, minutes) {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            const timeString = `${displayHour}:${minutes} ${ampm}`;
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-option';
            optionDiv.innerText = timeString;
            
            // Evento al hacer clic en una opción
            optionDiv.onclick = () => {
                selectTimeOption(timeString, optionDiv);
            };
            
            container.appendChild(optionDiv);
        }

        function toggleSelect() {
            const select = document.getElementById('customSelect');
            const trigger = select.querySelector('.custom-select-trigger');
            select.classList.toggle('open');
            trigger.classList.toggle('active-trigger');
        }

        function selectTimeOption(time, element) {
            // Guardamos el valor
            selectedTime = time;
            
            // Actualizamos el texto del trigger
            document.getElementById('triggerText').innerText = time;
            document.getElementById('triggerText').style.color = 'var(--text-main)';
            document.getElementById('triggerText').style.fontWeight = '600';

            // Marcamos visualmente la opción seleccionada
            document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');

            // Cerramos el menú
            toggleSelect();
        }

        // Cerrar el menú si se hace clic fuera de él
        window.onclick = function(event) {
            const select = document.getElementById('customSelect');
            if (!select.contains(event.target)) {
                select.classList.remove('open');
                select.querySelector('.custom-select-trigger').classList.remove('active-trigger');
            }
        }

        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        // --- GENERADOR DE HORARIOS DE LA DOCTORA ---
        function renderTimeSlots() {
            const container = document.getElementById('timeSlotsContainer');
            container.innerHTML = ''; // Limpiamos cualquier contenido previo
            
            // Definimos los bloques de horario (Formato 12h)
            // Mañana: 8am - 12pm | Tarde: 2pm - 6pm
            const schedule = [
                "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", // Bloque Mañana
                "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"  // Bloque Tarde
            ];

            schedule.forEach(time => {
                const btn = document.createElement('div');
                btn.className = 'time-slot';
                btn.innerText = time;
                // Al hacer clic, llamamos a la función de selección
                btn.onclick = () => selectTime(btn, time);
                container.appendChild(btn);
            });
        }

        function renderCalendar() {
            const container = document.getElementById('calendarGrid');
            const label = document.getElementById('currentMonthLabel');
            
            // Limpiar días anteriores (manteniendo los headers L, M, M...)
            const headers = container.querySelectorAll('.cal-day-name');
            container.innerHTML = '';
            headers.forEach(h => container.appendChild(h));

            const year = currDate.getFullYear();
            const month = currDate.getMonth();
            
            label.innerText = `${months[month]} ${year}`;

            // Obtener primer día del mes y total de días
            // Ajuste: getDay() devuelve 0 para Domingo, queremos que Lunes sea 0
            let firstDay = new Date(year, month, 1).getDay(); 
            firstDay = firstDay === 0 ? 6 : firstDay - 1; 
            
            const lastDate = new Date(year, month + 1, 0).getDate();

            // Días vacíos previos
            for (let i = 0; i < firstDay; i++) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('cal-day', 'empty');
                container.appendChild(emptyDiv);
            }

            // Días del mes
            for (let i = 1; i <= lastDate; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('cal-day');
                dayDiv.innerText = i;
                
                // Marcar si ya estaba seleccionado en este mes
                if (selectedDate && 
                    selectedDate.getDate() === i && 
                    selectedDate.getMonth() === month && 
                    selectedDate.getFullYear() === year) {
                    dayDiv.classList.add('active');
                }

                dayDiv.onclick = () => selectDate(i, dayDiv);
                container.appendChild(dayDiv);
            }
        }

        function changeMonth(delta) {
            currDate.setMonth(currDate.getMonth() + delta);
            renderCalendar();
        }

        function selectDate(day, element) {
            // Guardar fecha seleccionada
            selectedDate = new Date(currDate.getFullYear(), currDate.getMonth(), day);
            
            // Visual
            document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        // (La función selectTime ya no es necesaria y se puede borrar)

        function sendBooking() {
            const name = document.getElementById('patientName').value.trim();
            
            // Validaciones usando las variables globales
            if (!selectedDate) return alert("Por favor, selecciona un día en el calendario.");
            if (!selectedTime) return alert("Por favor, selecciona una hora de la lista.");
            if (!name) return alert("Por favor, escribe tu nombre.");

            // Formatear mensaje
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = selectedDate.toLocaleDateString('es-ES', options);
            
            const message = `Hola Dra. Elena, quisiera *solicitar disponibilidad* para una cita.%0A%0A👤 *Paciente:* ${name}%0A📅 *Fecha:* ${dateStr}%0A⏰ *Hora:* ${selectedTime}%0A%0A¿Tiene este horario disponible? Quedo atento a su confirmación.`;
            
            const phone = "584162779279"; 
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }

        // Iniciar calendario y generar opciones del select
        renderCalendar();
        renderTimeOptions();
        
        // Refrescar iconos para la flecha del select
        lucide.createIcons();