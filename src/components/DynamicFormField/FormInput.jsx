import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

const FormInput = ({
  name,
  label = "",
  rules = {},
  type = "text",
  inputProps = {},
  multiline = false,
}) => {
  const { control, setValue, getValues } = useFormContext();
  const isFileInput = type === "file";

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const value = getValues(name);
        return (
          <TextField
            label={label}
            type={type}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            fullWidth
            error={!!error}
            helperText={error?.message}
            inputProps={inputProps}
            onChange={
              isFileInput
                ? (e) => field.onChange(e.target.files)
                : field.onChange
            }
            {...(!isFileInput ? { ...field, value: field.value ?? "" } : {})}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment:
                !isFileInput && value && (label==="Search Products") ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setValue(name, "")}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
            }}
          />
        );
      }}
    />
  );
};

export default FormInput;
