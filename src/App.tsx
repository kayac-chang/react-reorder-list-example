import { useRef, useState } from "react";

const initialItems = ["🍅 Tomato", "🥒 Cucumber", "🧀 Cheese", "🥬 Lettuce"];

function Reorder() {
  const [items] = useState(initialItems);
  const ref = useRef<HTMLDivElement>(null);

  // implement drag logic
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const container = ref.current;
    if (!container) return;

    const target = event.currentTarget;
    if (!target.dataset.reorderItem) return;

    const dragged = target.cloneNode(true) as HTMLDivElement;
    Object.assign(dragged.style, {
      position: "fixed",
      width: `${target.offsetWidth}px`,
      height: `${target.offsetHeight}px`,
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      transform: "translate(-50%, -50%)",
    });
    container.append(dragged);
    target.style.visibility = "hidden";

    function onPointerMove(event: PointerEvent) {
      Object.assign(dragged.style, {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`,
      });
    }

    function onPointerUp() {
      dragged.remove();
      target.style.visibility = "visible";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return (
    <div ref={ref}>
      <ul data-reorder>
        {items.map((item) => (
          <li key={item}>
            <div data-reorder-item={item} onPointerDown={onPointerDown}>
              {item}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return <Reorder />;
}

export default App;
