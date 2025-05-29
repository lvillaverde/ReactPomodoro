import { Flex, Button, TextField } from "@radix-ui/themes";

function NumberSelector({ label = "", value, setValue, disabled }) {
  return (
    <Flex direction="column" gap="1">
      {label && <label>{label}</label>}
      <Flex direction="row" gap="2">
        <Button
          variant="soft"
          color="gray"
          onClick={() => setValue(prev => String(Math.max(0, Number(prev) - 1)))}
          disabled={Number(value) <= 0 || disabled}
          style={{ minWidth: 40 }}
        >-</Button>
        <TextField.Root
          type="number"
          min={0}
          value={value}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "");
            setValue(val === "" ? "0" : String(Math.max(0, Number(val))));
          }}
          style={{
            width: 60,
            textAlign: "center",
            fontSize: 20,
            padding: "6px 0"
          }}
          disabled={disabled}
        />
        <Button
          variant="soft"
          color="gray"
          onClick={() => setValue(prev => String(Number(prev) + 1))}
          style={{ minWidth: 40 }}
          disabled={disabled}
        >+</Button>
      </Flex>
    </Flex>
  );
}

export default NumberSelector;
