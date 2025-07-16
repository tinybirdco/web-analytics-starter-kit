import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Widgets, CoreVitals } from './widgets'

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="analytics">
      <TabsList className="mb-4">
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="speed">Speed Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="analytics">
        <Widgets />
      </TabsContent>
      <TabsContent value="speed">
        <CoreVitals />
      </TabsContent>
    </Tabs>
  )
}

export default DashboardTabs
