class PaintTools extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }

      connectedCallback() {
        const canvasId = this.getAttribute('data-canvas');
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');

        this.shadowRoot.innerHTML = `
          <style>
            .controls {
              margin: 10px 0;
            }
            label {
              margin: 0 10px;
            }
          </style>
          <div class="controls">
            <label>Kolor: <input type="color" id="colorPicker" value="#000000"></label>
            <label>Grubość: <input type="range" id="sizePicker" min="1" max="50" value="5"></label>
            <button id="pipetteButton">Pipeta</button>
          </div>
        `;

        const colorPicker = this.shadowRoot.getElementById('colorPicker');
        const sizePicker = this.shadowRoot.getElementById('sizePicker');
        const pipetteButton = this.shadowRoot.getElementById('pipetteButton');

        let drawing = false;
        let pipetteMode = false;

        function getCanvasPos(e) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          if (e.touches) {
            return {
              x: (e.touches[0].clientX - rect.left) * scaleX,
              y: (e.touches[0].clientY - rect.top) * scaleY
            };
          } else {
            return {
              x: (e.clientX - rect.left) * scaleX,
              y: (e.clientY - rect.top) * scaleY
            };
          }
        }

        function startDraw(e) {
          const isAlt = e.altKey || pipetteMode;
          const pos = getCanvasPos(e);

          if (isAlt) {
            const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            const hex = `#${[pixel[0], pixel[1], pixel[2]]
              .map(x => x.toString(16).padStart(2, '0')).join('')}`;
            colorPicker.value = hex;
            pipetteMode = false;
            e.preventDefault();
            return;
          }

          drawing = true;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          e.preventDefault();
        }

        function stopDraw(e) {
          drawing = false;
          ctx.beginPath();
          e.preventDefault();
        }

        function draw(e) {
          if (!drawing) return;
          const pos = getCanvasPos(e);
          ctx.lineWidth = sizePicker.value;
          ctx.lineCap = 'round';
          ctx.strokeStyle = colorPicker.value;
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          e.preventDefault();
        }

        // Mysz
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);

        // Dotyk
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
        canvas.addEventListener('touchcancel', stopDraw);

        pipetteButton.addEventListener('click', () => {
          pipetteMode = true;
        });
      }
    }

    customElements.define('paint-tools', PaintTools);