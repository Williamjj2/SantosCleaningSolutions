import { GetStaticProps } from 'next'
import { SeoHead } from '../components/SeoHead'

export default function Home() {
  return (
    <>
      <SeoHead
        title="House Cleaning Marietta & Atlanta | Santos Cleaning"
        description="Professional house & office cleaning in Marietta & Atlanta. Deep, move-in/out & recurring. Licensed & insured. Free estimate."
        canonical="https://santoscsolutions.com/"
      />
      <main>
        <h1>House Cleaning in Marietta & Atlanta</h1>
        <p>Server-rendered content for SEO.</p>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} }
}


