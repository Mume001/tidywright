import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/theme.css'

/**
 * Every story renders in both themes. The app is dark, the report and the embed
 * form are light and carry the agency colour. A component that only looks right
 * in one of them is not finished.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'report' ? 'report' : 'app'
  return (
    <div
      data-theme={theme === 'report' ? 'report' : undefined}
      style={
        {
          background: 'var(--color-bg)',
          color: 'var(--color-tx)',
          padding: 24,
          minHeight: '100vh',
          '--agency-primary': '#1F5AF6',
          '--agency-on-primary': '#ffffff',
        } as React.CSSProperties
      }
    >
      <Story />
    </div>
  )
}

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'App is dark, report is the agency branded light theme',
      defaultValue: 'app',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'app', title: 'App (dark)' },
          { value: 'report', title: 'Report (light)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
}

export default preview
