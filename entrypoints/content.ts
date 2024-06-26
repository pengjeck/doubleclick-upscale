import zoom from './zoom'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    const zoom_op = zoom(document)

    let zoomed = () => {
      return Math.abs(zoom_op.zoomLevel() - 1) > 0.001
    };

    let lastRightClickedElement: EventTarget | null = null;
    document.addEventListener('contextmenu', function (event) {
      lastRightClickedElement = event.target;
    })

    document.addEventListener('mouseover', function (event) {
      lastRightClickedElement = event.target;
    })

    browser.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        console.log(request)
        if (request.action === "zoomIn" && lastRightClickedElement) {
          if (lastRightClickedElement && lastRightClickedElement instanceof HTMLElement) {
            zoom_op.to({
              element: lastRightClickedElement,
            })
          } else {
            console.error("No valid element selected")
          }
        }
      }
    );

    document.addEventListener('keyup', function (event) {
      console.log("keypress key=", event.key, "zoomed=", zoomed())
      if (zoomed() && event.key === 'Escape') {
        zoom_op.out({})
        event.stopImmediatePropagation();
      }
    })

    document.addEventListener('keydown', function (event) {
      if (zoomed() && event.key === 'Escape') {
        event.stopImmediatePropagation();
      }
    })

    document.addEventListener('keypress', function (event) {
      if (zoomed() && event.key === 'Escape') {
        event.stopImmediatePropagation();
      }
    })
  },
});
