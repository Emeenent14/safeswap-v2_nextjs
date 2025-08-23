import { Button } from "@/components/ui/button"
import  Footer  from "@/components/common/Footer"
import  Header  from "@/components/common/Header"
import  Sidebar  from "@/components/common/Sidebar"
import  PageLoader  from "@/components/common/PageLoader"



export default function Home() {
  return (
    <div>
      <Header />
      <Sidebar />
      <PageLoader/>
      <Button className="bg-red-500">Test</Button>
      <Footer variant="minimal" className="mt-8" />
    </div>
  )
}
