import { useRef, useState } from "react";

const initialItems = ["🍅 Tomato", "🥒 Cucumber", "🧀 Cheese", "🥬 Lettuce"];

function Reorder() {
  const [items, setItems] = useState(initialItems);
  const ref = useRef<HTMLUListElement>(null);

  function onReorder(items: string[]) {
    setItems(items);
  }

  function onPointerDown(event: React.PointerEvent<HTMLLIElement>) {
    const container = ref.current;
    if (!container) return;

    const target = event.currentTarget;

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

    Array.from(container.children)
      .filter((child) => child !== dragged)
      .forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        Object.assign(child.style, {
          transition: "transform 0.2s",
          transform: "translateY(0)",
        });
      });

    const target_anchor = {
      child: target,
      top: target.getBoundingClientRect().top,
      bottom: target.getBoundingClientRect().bottom,
    };

    const items = Array.from(container.children).filter(
      (child) => child !== dragged
    ) as HTMLElement[];

    const fronts = items.slice(items.indexOf(target) + 1).map((child) => ({
      child,
      y: child.getBoundingClientRect().top,
    }));

    const backs = items
      .slice(0, items.indexOf(target))
      .map((child) => ({
        child,
        y: child.getBoundingClientRect().bottom,
      }))
      .reverse();

    function onPointerMove(event: PointerEvent) {
      Object.assign(dragged.style, {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`,
      });

      if (!container) return;

      items.forEach((item) => {
        item.style.transform = `translateY(0)`;
      });

      fronts
        .filter((anchor) => event.clientY > anchor.y)
        .reduce(
          (pre, anchor) => {
            anchor.child.style.transform = `translateY(${pre.y - anchor.y}px)`;
            target_anchor.child.style.transform = `translateY(${
              anchor.y - target_anchor.top
            }px`;
            return anchor;
          },
          {
            ...target_anchor,
            y: target_anchor.top,
          }
        );
      backs
        .filter((anchor) => event.clientY < anchor.y)
        .reduce(
          (pre, anchor) => {
            anchor.child.style.transform = `translateY(${pre.y - anchor.y}px)`;
            target_anchor.child.style.transform = `translateY(${
              anchor.y - target_anchor.bottom
            }px`;
            return anchor;
          },
          {
            ...target_anchor,
            y: target_anchor.bottom,
          }
        );
    }

    function onPointerUp() {
      onReorder(
        items
          .sort(
            (a, b) =>
              a.getBoundingClientRect().top - b.getBoundingClientRect().top
          )
          .map((item) => item.dataset.reorderItem) as string[]
      );

      dragged.remove();
      target.style.visibility = "visible";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      if (!container) return;
      items.forEach((child) => {
        child.removeAttribute("style");
      });
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return (
    <ul data-reorder ref={ref}>
      {items.map((item) => (
        <li key={item} onPointerDown={onPointerDown} data-reorder-item={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function App() {
  return <Reorder />;
}

export default App;
