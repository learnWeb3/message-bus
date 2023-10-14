export function Select({
  selected = "id-1",
  setSelected = (selected) => {
    console.log(selected);
  },
  name = "select-test",
  id = "select-test",
  options = [
    {
      id: "id-1",
      label: "1",
      value: "id-1",
    },
    {
      id: "id-2",
      label: "2",
      value: "id-2",
    },
    {
      id: "id-3",
      label: "3",
      value: "id-3",
    },
  ],
}) {
  return (
    <select
      className="block py-2 px-2.5 rounded w-full text-sm bg-transparent border-0 border-2 appearance-none text-gray-200 border-gray-200 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
      name={name}
      id={id}
      onInput={(event) =>
        setSelected(options[event.target.selectedIndex].value)
      }
    >
      {options.map(({ id, label, value }) => (
        <option
          key={`${name}-${id}`}
          value={value}
          id={id}
          defaultValue={id === selected}
          className={`${id === selected ? "selected" : ""}`}
        >
          {label}
        </option>
      ))}
    </select>
  );
}
