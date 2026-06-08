/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import './EDUmindFooter.css';

interface NavigationLink {
    href: string;
    label?: string;
}

interface EDUmindFooterProps {
    appName: string;
    version: string;
    versionStage?: 'Alpha' | 'Beta' | 'Stable' | 'RC';
    author?: string;
    year?: number;
    previousPage?: NavigationLink;
    nextPage?: NavigationLink;
    homeHref?: string;
    feedbackUrl?: string;
    feedbackLabel?: string;
    className?: string;
    locale?: 'es' | 'en' | 'zh';
    hideNavigation?: boolean;
    showVersion?: boolean;
}

interface FooterTranslations {
    previous: string;
    next: string;
    copyright: string;
    feedback: string;
    home: string;
}

const translations: Record<string, FooterTranslations> = {
    es: {
        previous: '← Anterior',
        next: 'Siguiente →',
        copyright: '© {year} EDUmind por',
        feedback: '📋 Reportar Error',
        home: '🏠 Inicio'
    },
    en: {
        previous: '← Previous',
        next: 'Next →',
        copyright: '© {year} EDUmind by',
        feedback: '📋 Report Issue',
        home: '🏠 Home'
    },
    zh: {
        previous: '← 上一页',
        next: '下一页 →',
        copyright: '© {year} EDUmind 由',
        feedback: '📋 报告问题',
        home: '🏠 首页'
    }
};

export default function EDUmindFooter({
    appName,
    version,
    versionStage,
    author = 'EDUmind Team',
    year = new Date().getFullYear(),
    previousPage,
    nextPage,
    homeHref,
    feedbackUrl,
    feedbackLabel,
    className = '',
    locale = 'es',
    hideNavigation = false,
    showVersion = true
}: EDUmindFooterProps) {
    const t = translations[locale] || translations.es;

    const versionBadge = versionStage
        ? `v${version} (${versionStage})`
        : `v${version}`;

    return (
        <footer className={`edumind-footer ${className}`}>
            {!hideNavigation && (previousPage || nextPage || homeHref) && (
                <div className="footer-nav">
                    {previousPage && (
                        <a href={previousPage.href} className="nav-btn nav-btn-prev">
                            {previousPage.label || t.previous}
                        </a>
                    )}

                    {previousPage && (nextPage || homeHref) && (
                        <span className="divider">|</span>
                    )}

                    {homeHref && !nextPage && (
                        <a href={homeHref} className="nav-btn nav-btn-home">
                            {t.home}
                        </a>
                    )}

                    {nextPage && (
                        <a href={nextPage.href} className="nav-btn nav-btn-next">
                            {nextPage.label || t.next}
                        </a>
                    )}
                </div>
            )}

            <div className="footer-info">
                <p>
                    {t.copyright.replace('{year}', year.toString())}{' '}
                    <strong>{author}</strong>
                    {appName && <span className="footer-app-name"> · {appName}</span>}
                </p>
            </div>

            <div className="footer-legal" style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#6b7280'
            }}>
                <a href="https://edumind.es/es/legal/privacidad" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                }}>Privacidad</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/legal" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Aviso Legal</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/legal/cookies" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Cookies</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://edumind.es/es/legal/ia" target="_blank" rel="noopener noreferrer" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Política de IA</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="/proponer-deporte" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>Proponer Deporte</a>
                <span style={{ margin: '0 0.5rem' }}>·</span>
                <a href="https://donar.edumind.es" target="_blank" rel="noopener noreferrer" style={{
                    color: '#10b981',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}>💚 Apoyar</a>

                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="https://t.me/EDUmind_es" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', textDecoration: 'none' }}>📢 Telegram</a>
                    <a href="https://instagram.com/edumind_es" target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', textDecoration: 'none' }}>📸 Instagram</a>
                    <a href="https://x.com/edumind_es" target="_blank" rel="noopener noreferrer" style={{ color: '#000000', textDecoration: 'none' }}>𝕏 Twitter</a>
                    <a href="https://mastodon.social/@EDUmind" target="_blank" rel="noopener noreferrer" style={{ color: '#6364FF', textDecoration: 'none' }}>🐘 Mastodon</a>
                    <a href="https://blog.edumind.es" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>📝 Blog</a>
                </div>
            </div>

            <div className="footer-meta">
                {showVersion && (
                    <span className="badge version-badge">{versionBadge}</span>
                )}
                {feedbackUrl && (
                    <a
                        href={feedbackUrl}
                        className="feedback-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={feedbackLabel || t.feedback}
                    >
                        {feedbackLabel || t.feedback}
                    </a>
                )}
            </div>
        </footer>
    );
}
