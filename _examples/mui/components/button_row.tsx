/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Box, BoxProps, Button, ButtonProps } from "@mui/material";

export interface ButtonRowProps extends Omit<BoxProps, "children"> {
  variant?: ButtonProps["variant"];
}

export function ButtonRow({ variant, ...rest }: ButtonRowProps) {
  return (
    <Box sx={{ display: "flex", gap: "1em" }} {...rest}>
      <Button variant={variant} color="primary">
        Primary
      </Button>
      <Button variant={variant} color="secondary">
        Secondary
      </Button>
      <Button variant={variant} color="success">
        Success
      </Button>
      <Button variant={variant} color="error">
        Error
      </Button>
    </Box>
  );
}
