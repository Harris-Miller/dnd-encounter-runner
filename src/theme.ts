import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    ddb: {
      gold: string;
      parchment: string;
      statBlockBorder: string;
      statBlockHeaderRule: string;
    };
  }

  interface ThemeOptions {
    ddb?: {
      gold?: string;
      parchment?: string;
      statBlockBorder?: string;
      statBlockHeaderRule?: string;
    };
  }
}

const ddbGrey900 = '#12181c';
const ddbGrey800 = '#232b2f';
const ddbGrey700 = '#374045';
const ddbGrey600 = '#525c63';
const ddbGrey300 = '#c4cbce';
const ddbRed500 = '#e40712';
const ddbRed600 = '#c50009';
const ddbRed400 = '#fe4736';
const ddbGold500 = '#ae863d';
const ddbGold400 = '#c29e4d';
const ddbGold300 = '#d1b873';
const ddbParchment50 = '#f5f3ee';
const ddbParchment400 = '#afa47a';
const ddbStatBlockBg = '#f6f3ee';
const ddbStatBlockBorder = '#a7a3a0';
const ddbStatBlockHeaderRule = '#7a3c2f';
const ddbGreen500 = '#4bba5a';
const ddbSky500 = '#5d8ae9';
const ddbSky400 = '#7daaf0';
const ddbWhite = '#ffffff';

const fontDefault = '"Roboto Flex", Roboto, Helvetica, sans-serif';
const fontStorytelling = 'Majesty, "Roboto Flex", Roboto, Helvetica, sans-serif';
const fontCondensed = '"Roboto Condensed", Roboto, Helvetica, sans-serif';
const fontBrand = 'Tiamat, Majesty, serif';

const sharedPalette = {
  error: {
    main: ddbRed500,
  },
  primary: {
    contrastText: ddbWhite,
    dark: ddbRed600,
    main: ddbRed500,
  },
  success: {
    main: ddbGreen500,
  },
};

export const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        ...sharedPalette,
        background: {
          default: ddbGrey900,
          paper: ddbGrey800,
        },
        divider: ddbGrey700,
        error: {
          main: ddbRed400,
        },
        info: {
          main: ddbSky400,
        },
        secondary: {
          contrastText: ddbGrey900,
          main: ddbParchment400,
        },
        text: {
          primary: ddbWhite,
          secondary: ddbGrey300,
        },
        warning: {
          main: ddbGold400,
        },
      },
    },
    light: {
      palette: {
        ...sharedPalette,
        background: {
          default: ddbParchment50,
          paper: ddbStatBlockBg,
        },
        divider: ddbStatBlockBorder,
        error: {
          main: ddbRed500,
        },
        info: {
          main: ddbSky500,
        },
        secondary: {
          contrastText: ddbWhite,
          main: ddbGold500,
        },
        text: {
          primary: ddbGrey900,
          secondary: ddbGrey600,
        },
        warning: {
          main: ddbGold300,
        },
      },
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: ddbGrey900,
          color: ddbWhite,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme: muiTheme }) => ({
          borderRadius: muiTheme.shape.borderRadius,
          ...(ownerState.color === 'primary' &&
            ownerState.variant === 'contained' && {
              '&:hover': {
                backgroundColor: ddbRed600,
              },
            }),
          ...(ownerState.variant === 'outlined' && {
            ...muiTheme.applyStyles('dark', {
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: ddbGrey300,
              },
              borderColor: ddbWhite,
              color: ddbWhite,
            }),
            ...muiTheme.applyStyles('light', {
              '&:hover': {
                backgroundColor: 'rgba(18, 24, 28, 0.04)',
                borderColor: ddbGrey700,
              },
              borderColor: ddbGrey600,
              color: ddbGrey900,
            }),
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          backgroundImage: 'none',
          ...muiTheme.applyStyles('light', {
            border: `1px solid ${ddbStatBlockBorder}`,
            outline: `1px solid ${ddbStatBlockBorder}`,
            outlineOffset: -4,
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: ({ theme: muiTheme }) => ({
          ...muiTheme.applyStyles('light', {
            borderColor: ddbStatBlockBorder,
          }),
          ...muiTheme.applyStyles('dark', {
            borderColor: ddbGrey700,
          }),
        }),
        root: {
          fontFamily: fontCondensed,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: muiTheme => ({
        '@media (pointer: fine) and (hover: hover)': {
          '*': {
            scrollbarColor: `${ddbGrey600} ${ddbGrey800}`,
            scrollbarWidth: 'thin',
          },
        },
        body: {
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
        },
        ...muiTheme.applyStyles('light', {
          '@media (pointer: fine) and (hover: hover)': {
            '*': {
              scrollbarColor: `${ddbStatBlockBorder} ${ddbParchment50}`,
            },
          },
        }),
      }),
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          '&:hover': {
            boxShadow: `0 -0.125rem 0 0 ${ddbRed500} inset`,
          },
          color: muiTheme.palette.info.main,
          textDecoration: 'none',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme: muiTheme }) => ({
          ...muiTheme.applyStyles('light', {
            borderColor: ddbStatBlockBorder,
          }),
        }),
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  ddb: {
    gold: ddbGold500,
    parchment: ddbParchment50,
    statBlockBorder: ddbStatBlockBorder,
    statBlockHeaderRule: ddbStatBlockHeaderRule,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    button: {
      fontFamily: fontDefault,
      fontWeight: 500,
      textTransform: 'none',
    },
    fontFamily: fontDefault,
    h1: {
      fontFamily: fontBrand,
      fontWeight: 700,
    },
    h2: {
      fontFamily: fontStorytelling,
      fontWeight: 700,
    },
    h3: {
      fontFamily: fontStorytelling,
      fontWeight: 700,
    },
    h4: {
      fontFamily: fontStorytelling,
      fontWeight: 500,
    },
    h5: {
      fontFamily: fontCondensed,
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    h6: {
      fontFamily: fontCondensed,
      fontWeight: 700,
      textTransform: 'uppercase',
    },
  },
});
