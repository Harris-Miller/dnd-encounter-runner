import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    // Apply dense to List and Menu items
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    // Use 'small' sizing for TextFields and Tables instead of dense
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
        size: 'small',
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});
