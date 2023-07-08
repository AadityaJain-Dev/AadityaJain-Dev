let url = './pdf/Aditya Jain Resume.pdf';

let pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

if (window.innerWidth <= 800) {
    scale = 1;

    document.getElementById('download').style.left = '15px';
    setInterval(function () {
        if (
            (document.documentElement.scrollTop || document.body.scrollTop) > 60
        ) {
            document.getElementById('download').style.top = 'unset';
            document.getElementById('download').style.bottom = '1rem';
        } else {
            document.getElementById('download').style.top = '48rem';
            document.getElementById('download').style.bottom = 'unset';
        }
    }, 500);
}

function renderPage(num, canvas) {
    let ctx = canvas.getContext('2d');
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        let viewport = page.getViewport({ scale: scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };
        let renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
}

pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;

    const pages = parseInt(pdfDoc.numPages);

    let canvasHtml = '';
    for (let i = 0; i < pages; i++) {
        canvasHtml += '<canvas id="canvas_' + i + '"></canvas>';
    }

    document.getElementById('canvases').innerHTML = canvasHtml;

    for (let i = 0; i < pages; i++) {
        let canvas = document.getElementById('canvas_' + i);
        renderPage(i + 1, canvas);
    }
});
