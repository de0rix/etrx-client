export interface Option {
  label: string;
  value: any;
}

interface RadioGroupProps {
  title: string;
  options: Option[];
  name: string;
  value: any;
  onChange: any;
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <div
      className="m-auto rounded-md h-fit px-4 py-2 w-fit bg-background-shade"
      role="radiogroup"
    >
      <div className="text-center">{props.title}</div>
      <div className="flex">
        {props.options.map((option) => (
          <label key={option.value} className="block mx-[10px]">
            <input
              type="radio"
              name={props.name}
              value={option.value}
              checked={props.value == option.value}
              onChange={(event) => props.onChange(event.target.value)}
              style={{ margin: '0 5px 0 0' }}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
