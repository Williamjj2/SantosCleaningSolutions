import Head from 'next/head'

type Props = {
  title: string
  description: string
  canonical: string
  image?: string
  noindex?: boolean
}

export function SeoHead({ title, description, canonical, image = 'https://santoscsolutions.com/images/santos-logo.png', noindex = false }: Props) {
  const metaTitle = title.length > 60 ? title.slice(0, 57) + '…' : title
  const metaDesc = description.length > 160 ? description.slice(0, 157) + '…' : description
  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={image} />
    </Head>
  )
}


