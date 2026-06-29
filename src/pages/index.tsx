import React, {ReactNode, useMemo, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {Analytics} from "@vercel/analytics/react"
import {SpeedInsights} from '@vercel/speed-insights/react';
import {Box, Container, Grid, InputAdornment, TextField, Typography} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Translate, {translate} from "@docusaurus/Translate";
import CardInfo from "@site/src/components/CardInfo";
import MiniAppQRCode from "@site/src/components/MiniAppQRCode";
import {indexCard} from "@site/src/config/index.config";

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return indexCard;
    const q = query.trim().toLowerCase();
    return indexCard
      .map(group => ({
        ...group,
        cards: group.cards.filter(
          c => c.name.toLowerCase().includes(q) || (c.desc || '').toLowerCase().includes(q)
        ),
      }))
      .filter(group =>
        group.name.toLowerCase().includes(q) ||
        (group.desc || '').toLowerCase().includes(q) ||
        group.cards.length > 0
      );
  }, [query]);

  return (
    <Layout
      title="PISM"
      description={translate({message: "PISM 提供各种在线开发工具"})}
    >
      <main>
        {/* Hero */}
        <Box sx={{
          textAlign: 'center',
          pt: {xs: 6, md: 10},
          pb: {xs: 4, md: 6},
          px: 2,
        }}>
          <Box
            component="img"
            src="/img/pism.svg"
            alt="PISM"
            sx={{width: {xs: 64, md: 80}, height: {xs: 64, md: 80}, mb: 2}}
          />
          <Typography
            component="h1"
            sx={{
              fontSize: {xs: '2.2rem', md: '3rem'},
              fontWeight: 800,
              color: '#1d1d1f',
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            PISM
          </Typography>
          <Typography
            sx={{
              fontSize: {xs: '1rem', md: '1.15rem'},
              color: '#86868b',
              fontWeight: 400,
              mb: 0.5,
            }}
          >
            Plan · Implement · Simplify · Master
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: '#86868b',
              fontWeight: 400,
            }}
          >
            <Translate>各种在线开发与实用工具</Translate>
          </Typography>
        </Box>

        {/* Search */}
        <Container maxWidth="sm" sx={{mb: 6}}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translate({message: '搜索工具...'})}
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{color: '#86868b', fontSize: 20}}/>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f5f5f7',
                fontSize: '0.95rem',
                '& fieldset': {borderColor: 'transparent'},
                '&:hover fieldset': {borderColor: '#d2d2d7'},
                '&.Mui-focused fieldset': {borderColor: '#860e0e', borderWidth: 1},
                '&.Mui-focused': {backgroundColor: '#fff'},
              },
            }}
          />
        </Container>

        {/* Tool Groups */}
        <Container maxWidth="lg" sx={{pb: 8}}>
          {filteredGroups.map((group) => (
            <Box key={group.id} sx={{mb: 5}}>
              <Typography
                component="h2"
                sx={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#1d1d1f',
                  mb: 0.5,
                }}
              >
                {group.name}
              </Typography>
              {group.desc && (
                <Typography sx={{fontSize: '0.85rem', color: '#86868b', mb: 2}}>
                  {group.desc}
                </Typography>
              )}
              <Grid container spacing={{xs: 1.5, md: 2}}>
                {group.cards.map(card => (
                  <Grid key={card.id} size={{xs: 12, sm: 6, md: 4, lg: 3}}>
                    <CardInfo
                      item={{
                        type: "link",
                        label: card.name,
                        href: card.href,
                        docId: card.id,
                        description: card.desc,
                        unlisted: true,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {filteredGroups.length === 0 && (
            <Box sx={{textAlign: 'center', py: 8, color: '#86868b'}}>
              <Translate>未找到匹配的工具</Translate>
            </Box>
          )}
        </Container>

        {/* QR Code */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          pb: 8,
        }}>
          <MiniAppQRCode/>
        </Box>
      </main>
      <Analytics/>
      <SpeedInsights/>
    </Layout>
  );
}
