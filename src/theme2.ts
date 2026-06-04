import { createTheme } from '@mui/material/styles';

// Display face for headings/titles: Cinzel is an OFL-licensed engraved Roman
// capital face that mirrors the carved title lettering of D&D source books.
const headingFontFamily = '"Cinzel", "Cinzel Decorative", "Georgia", "Times New Roman", serif';

// Body/UI face: Mulish is a clean OFL humanist sans that stands in for the
// proprietary Scala Sans used for D&D Beyond body copy and stat blocks.
const bodyFontFamily = '"Mulish", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: '#15110D',
          paper: '#1F1812',
        },
        divider: 'rgba(217, 180, 80, 0.18)',
        error: {
          contrastText: '#1A140E',
          dark: '#B23A2E',
          light: '#F08B7D',
          main: '#E15A4A',
        },
        info: {
          contrastText: '#1A140E',
          dark: '#3E6F86',
          light: '#9FD0E4',
          main: '#74B4CE',
        },
        primary: {
          contrastText: '#FFF6F2',
          dark: '#9A1115',
          light: '#E85A55',
          main: '#D4262A',
        },
        secondary: {
          contrastText: '#1A140E',
          dark: '#A8842F',
          light: '#E8CB77',
          main: '#D9B450',
        },
        success: {
          contrastText: '#10160C',
          dark: '#4E7B36',
          light: '#A8D98A',
          main: '#7FBE5C',
        },
        text: {
          primary: '#ECE3D2',
          secondary: '#B8AB95',
        },
        warning: {
          contrastText: '#1A140E',
          dark: '#B07F22',
          light: '#F4C967',
          main: '#E0A93B',
        },
      },
    },
    light: {
      palette: {
        background: {
          default: '#F3ECDC',
          paper: '#FBF6EA',
        },
        divider: 'rgba(74, 56, 32, 0.18)',
        error: {
          contrastText: '#FFF6F2',
          dark: '#7A1410',
          light: '#C5564E',
          main: '#9F2820',
        },
        info: {
          contrastText: '#FFF6F2',
          dark: '#1F4A5E',
          light: '#5E97AE',
          main: '#356C84',
        },
        primary: {
          contrastText: '#FFF6F2',
          dark: '#5E0F11',
          light: '#B5443F',
          main: '#8A1A1C',
        },
        secondary: {
          contrastText: '#2A2118',
          dark: '#7C5E12',
          light: '#CBAE5A',
          main: '#A6831F',
        },
        success: {
          contrastText: '#10160C',
          dark: '#3A5C26',
          light: '#7BA85A',
          main: '#4F7A33',
        },
        text: {
          primary: '#2A2118',
          secondary: '#5B4C3A',
        },
        warning: {
          contrastText: '#2A2118',
          dark: '#8A6310',
          light: '#D9AD46',
          main: '#B5851E',
        },
      },
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme: appBarTheme }) => ({
          backgroundImage: `linear-gradient(135deg, ${appBarTheme.palette.primary.dark} 0%, ${appBarTheme.palette.primary.main} 100%)`,
          borderBottom: `1px solid ${appBarTheme.palette.secondary.main}`,
        }),
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
        size: 'small',
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiList: {
      defaultProps: {
        dense: true,
      },
    },
    MuiMenuItem: {
      defaultProps: {
        dense: true,
      },
    },
    MuiRadio: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSwitch: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 6,
  typography: {
    button: {
      fontWeight: 700,
      letterSpacing: '0.06em',
    },
    fontFamily: bodyFontFamily,
    fontSize: 13,
    h1: {
      fontFamily: headingFontFamily,
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontFamily: headingFontFamily,
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h3: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h4: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h6: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
});
