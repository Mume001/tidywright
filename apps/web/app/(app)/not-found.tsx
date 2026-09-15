import { ButtonLink, Card, EmptyState, PageBody } from '@tw/ui'

/**
 * 404 inside the app, and also what a visitor sees when they ask for something
 * belonging to another agency. docs/16-access-control.md: no permission and no
 * such thing look identical on purpose, because the difference between them is
 * itself information.
 */
export default function AppNotFound() {
  return (
    <PageBody>
      <Card>
        <EmptyState
          title="This page is not here"
          description="The link may be old, or it may belong to a different agency."
          action={<ButtonLink href="/overview">Back to overview</ButtonLink>}
        />
      </Card>
    </PageBody>
  )
}
