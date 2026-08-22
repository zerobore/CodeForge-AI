/**
 * ============================================
 * CODE FORGE - Admin Panel Manager
 * ============================================
 * Real admin tooling (demo backend via localStorage):
 * - Overview: users, VIP members, promo redemptions, AI usage
 * - Promo Codes: list, generate, enable/disable, copy
 * - Users: registry, grant/revoke VIP, delete
 * - Activity: live activity log
 *
 * Access: activate the admin promo code (ZB-00-11-22-33)
 */

const AdminManager = {
    activeTab: 'overview',
    
    init() {
        // Guard: only admins may see this page
        if (typeof AuthManager === 'undefined' || !AuthManager.isAdmin()) {
            if (typeof showToast === 'function') {
                showToast('warning', 'Admin Only', 'Activate the admin promo code to access this panel.');
            }
            if (typeof navigateTo === 'function') navigateTo('vip');
            return;
        }
        
        this._bound = true;
        this.render();
    },
    
    // ---------- Data helpers ----------
    
    getUsers() {
        try {
            return Object.values(JSON.parse(localStorage.getItem(CONFIG.APP.USER_REGISTRY_KEY) || '{}'));
        } catch (e) {
            return [];
        }
    },
    
    getUsage() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.APP.PROMO_USAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    },
    
    setUsage(usage) {
        localStorage.setItem(CONFIG.APP.PROMO_USAGE_KEY, JSON.stringify(usage));
    },
    
    getAIUsage() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.APP.AI_USAGE_KEY) || '{}');
        } catch (e) {
            return { total: 0, conversations: 0, perProvider: {} };
        }
    },
    
    getActivity() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.APP.ACTIVITY_LOG_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },
    
    logActivity(event, detail) {
        if (typeof AuthManager !== 'undefined' && AuthManager.logActivity) {
            AuthManager.logActivity(event, detail);
        }
    },
    
    // All codes: built-in + admin-generated
    getAllPromoCodes() {
        const usage = this.getUsage();
        const codes = [];
        
        codes.push({
            code: CONFIG.PAYMENT.ADMIN_PROMO_CODE,
            type: 'admin',
            count: usage[CONFIG.PAYMENT.ADMIN_PROMO_CODE]?.count || 0,
            disabled: !!usage[CONFIG.PAYMENT.ADMIN_PROMO_CODE]?.disabled,
            generated: false
        });
        
        CONFIG.PAYMENT.PROMO_CODES.forEach(code => {
            codes.push({
                code,
                type: 'vip',
                count: usage[code]?.count || 0,
                disabled: !!usage[code]?.disabled,
                generated: false
            });
        });
        
        Object.entries(usage).forEach(([code, rec]) => {
            if (rec.generated && !codes.some(c => c.code === code)) {
                codes.push({ code, type: 'vip', count: rec.count || 0, disabled: !!rec.disabled, generated: true });
            }
        });
        
        return codes;
    },
    
    // Generate a new promo code in the same format (XXXX-XXXX-XXXX-XXXX)
    generatePromoCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        let code = `${block()}-${block()}-${block()}-${block()}`;
        
        const usage = this.getUsage();
        while (usage[code] || CONFIG.PAYMENT.PROMO_CODES.includes(code)) {
            code = `${block()}-${block()}-${block()}-${block()}`;
        }
        
        usage[code] = { count: 0, users: [], generated: true, createdAt: new Date().toISOString() };
        this.setUsage(usage);
        this.logActivity('promo-generated', `Admin generated promo code ${code}`);
        showToast('success', 'Promo Code', CONFIG.SUCCESS.PROMO_GENERATED);
        this.render();
    },
    
    togglePromoCode(code) {
        const usage = this.getUsage();
        if (!usage[code]) {
            usage[code] = { count: 0, users: [], generated: false };
        }
        usage[code].disabled = !usage[code].disabled;
        this.setUsage(usage);
        this.logActivity('promo-toggled', `${code} ${usage[code].disabled ? 'disabled' : 'enabled'}`);
        showToast('info', 'Promo Code', usage[code].disabled ? CONFIG.SUCCESS.PROMO_DISABLED : CONFIG.SUCCESS.PROMO_ENABLED);
        this.render();
    },
    
    // Grant or revoke VIP for a user id
    setUserVIP(uid, grant) {
        const sub = AuthManager.getSubRecord(uid);
        sub.subscription = grant ? 'vip' : 'free';
        sub.vipActive = grant;
        if (grant) sub.activatedAt = new Date().toISOString();
        localStorage.setItem(`codeforge_sub_${uid}`, JSON.stringify(sub));
        
        // Update registry
        const registry = JSON.parse(localStorage.getItem(CONFIG.APP.USER_REGISTRY_KEY) || '{}');
        if (registry[uid]) {
            registry[uid].subscription = sub.subscription;
            registry[uid].vipActive = grant;
            localStorage.setItem(CONFIG.APP.USER_REGISTRY_KEY, JSON.stringify(registry));
        }
        
        // Keep the live session in sync if admin edited themselves
        if (AuthManager.user && AuthManager.user.id === uid) {
            AuthManager.user.subscription = sub.subscription;
            AuthManager.user.vipActive = grant;
            AuthManager.saveSession(AuthManager.user);
            AuthManager.updateUI();
        }
        
        const user = this.getUsers().find(u => u.id === uid);
        this.logActivity(grant ? 'vip-granted' : 'vip-revoked', `${user?.name || uid} ${grant ? 'granted' : 'revoked'} VIP by admin`);
        showToast('success', grant ? 'VIP Granted' : 'VIP Revoked', grant ? CONFIG.SUCCESS.VIP_GRANTED : CONFIG.SUCCESS.VIP_REVOKED);
        this.render();
    },
    
    deleteUser(uid) {
        const user = this.getUsers().find(u => u.id === uid);
        if (!confirm(`Delete ${user?.name || 'this user'}? This cannot be undone.`)) return;
        
        const registry = JSON.parse(localStorage.getItem(CONFIG.APP.USER_REGISTRY_KEY) || '{}');
        delete registry[uid];
        localStorage.setItem(CONFIG.APP.USER_REGISTRY_KEY, JSON.stringify(registry));
        localStorage.removeItem(`codeforge_sub_${uid}`);
        
        this.logActivity('user-deleted', `Admin deleted ${user?.name || uid}`);
        showToast('info', 'User Deleted', 'User removed from registry.');
        this.render();
    },
    
    // ---------- Rendering ----------
    
    render() {
        if (!AuthManager.isAdmin()) return;
        this.renderTabs();
        
        switch (this.activeTab) {
            case 'overview': this.renderOverview(); break;
            case 'promos': this.renderPromoCodes(); break;
            case 'users': this.renderUsers(); break;
            case 'activity': this.renderActivity(); break;
        }
    },
    
    renderTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === this.activeTab);
        });
        document.querySelectorAll('.admin-tab-panel').forEach(panel => {
            panel.style.display = panel.id === `admin-panel-${this.activeTab}` ? '' : 'none';
        });
    },
    
    renderOverview() {
        const users = this.getUsers();
        const vipCount = users.filter(u => u.vipActive || u.isAdmin).length;
        const usage = this.getUsage();
        const redemptions = Object.values(usage).reduce((sum, r) => sum + (r.count || 0), 0);
        const ai = this.getAIUsage();
        const activity = this.getActivity();
        
        const el = document.getElementById('admin-panel-overview');
        if (!el) return;
        
        const providers = ai.perProvider || {};
        const maxProvider = Math.max(1, ...Object.values(providers));
        const providerRows = ['chatgpt', 'gemini', 'claude'].map(p => {
            const count = providers[p] || 0;
            const pct = Math.round((count / maxProvider) * 100);
            return `
                <div class="admin-usage-row">
                    <span class="usage-label"><i class="fas ${p === 'chatgpt' ? 'fa-comment-dots' : p === 'gemini' ? 'fa-brain' : 'fa-shield-halved'}"></i> ${p.toUpperCase()}</span>
                    <div class="usage-bar"><div class="usage-fill" style="width:${pct}%"></div></div>
                    <span class="usage-count">${count}</span>
                </div>
            `;
        }).join('');
        
        el.innerHTML = `
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <div class="admin-stat-icon blue"><i class="fas fa-users"></i></div>
                    <div><div class="admin-stat-value">${users.length}</div><div class="admin-stat-label">Registered Users</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon gold"><i class="fas fa-crown"></i></div>
                    <div><div class="admin-stat-value">${vipCount}</div><div class="admin-stat-label">VIP / Admin Members</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon green"><i class="fas fa-ticket-alt"></i></div>
                    <div><div class="admin-stat-value">${redemptions}</div><div class="admin-stat-label">Promo Redemptions</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-icon purple"><i class="fas fa-robot"></i></div>
                    <div><div class="admin-stat-value">${ai.total || 0}</div><div class="admin-stat-label">AI Messages (${ai.conversations || 0} convos)</div></div>
                </div>
            </div>
            
            <div class="admin-section-grid">
                <div class="admin-card">
                    <h4><i class="fas fa-chart-simple"></i> AI Usage by Provider</h4>
                    ${providerRows}
                </div>
                <div class="admin-card">
                    <h4><i class="fas fa-circle-info"></i> System Status</h4>
                    <ul class="admin-status-list">
                        <li><i class="fas fa-circle-check"></i> Firebase Auth <span class="status-ok">${typeof firebase !== 'undefined' && firebaseApp ? 'Connected' : 'Demo mode'}</span></li>
                        <li><i class="fas fa-circle-check"></i> reCAPTCHA v3 <span class="status-ok">${CONFIG.AUTH.RECAPTCHA.CONFIGURED ? 'Enabled' : 'Off'}</span></li>
                        <li><i class="fas fa-circle-check"></i> Google OAuth <span class="status-ok">${CONFIG.AUTH.GOOGLE.CONFIGURED ? 'Enabled' : 'Off'}</span></li>
                        <li><i class="fas fa-circle-check"></i> Google Ads <span class="status-ok">${CONFIG.ADSENSE?.ENABLED ?? CONFIG.ADS.ADSENSE.ENABLED ? 'Enabled' : 'Off'}</span></li>
                        <li><i class="fas fa-database"></i> Backend <span class="status-warn">localStorage (demo)</span></li>
                        <li><i class="fas fa-clock"></i> Last activity <span class="status-ok">${activity[0] ? timeAgo(activity[0].time) : '—'}</span></li>
                    </ul>
                </div>
            </div>
        `;
    },
    
    renderPromoCodes() {
        const el = document.getElementById('admin-panel-promos');
        if (!el) return;
        
        const codes = this.getAllPromoCodes();
        
        const rows = codes.map(c => {
            const masked = c.type === 'admin' ? c.code : c.code;
            return `
                <tr>
                    <td><code class="promo-code-chip ${c.type}">${masked}</code></td>
                    <td>${c.type === 'admin' ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-vip">VIP</span>'}</td>
                    <td>${c.count}</td>
                    <td>${c.generated ? '<span class="badge badge-info">Generated</span>' : '<span class="badge badge-info">Built-in</span>'}</td>
                    <td>${c.disabled ? '<span class="badge badge-danger">Disabled</span>' : '<span class="badge badge-success">Active</span>'}</td>
                    <td class="admin-actions-cell">
                        <button class="icon-btn" title="Copy code" onclick="AdminManager.copyCode('${c.code}')"><i class="fas fa-copy"></i></button>
                        <button class="icon-btn" title="${c.disabled ? 'Enable' : 'Disable'}" onclick="AdminManager.togglePromoCode('${c.code}')">
                            <i class="fas ${c.disabled ? 'fa-toggle-off' : 'fa-toggle-on'}"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        el.innerHTML = `
            <div class="admin-toolbar">
                <p class="admin-note"><i class="fas fa-circle-info"></i> Codes are single-use per user. Disable a code to block new redemptions. Generated codes work exactly like built-in VIP codes.</p>
                <button class="btn btn-primary" onclick="AdminManager.generatePromoCode()"><i class="fas fa-plus"></i> Generate Code</button>
            </div>
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr><th>Code</th><th>Type</th><th>Used</th><th>Origin</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },
    
    renderUsers() {
        const el = document.getElementById('admin-panel-users');
        if (!el) return;
        
        const users = this.getUsers().sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0));
        
        if (users.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>No registered users yet. Users appear here after they sign up or sign in.</p>
                </div>
            `;
            return;
        }
        
        const rows = users.map(u => `
            <tr>
                <td class="user-cell">
                    <div class="user-avatar-mini">${(u.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>${u.name || 'Unknown'}</strong>
                        <small>${u.email || ''}</small>
                    </div>
                </td>
                <td>${u.provider === 'google' ? '<span class="badge badge-google"><i class="fab fa-google"></i> Google</span>' : '<span class="badge badge-info">Email</span>'}</td>
                <td>${u.isAdmin ? '<span class="badge badge-admin">Admin</span>' : u.vipActive ? '<span class="badge badge-vip">VIP</span>' : '<span class="badge badge-muted">Free</span>'}</td>
                <td>${u.lastLogin ? timeAgo(u.lastLogin) : '—'}</td>
                <td class="admin-actions-cell">
                    <button class="btn btn-sm ${u.vipActive ? 'btn-outline' : 'btn-vip'}" onclick="AdminManager.setUserVIP('${u.id}', ${!u.vipActive})">
                        ${u.vipActive ? '<i class="fas fa-user-slash"></i> Revoke VIP' : '<i class="fas fa-crown"></i> Grant VIP'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AdminManager.deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
        
        el.innerHTML = `
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr><th>User</th><th>Provider</th><th>Plan</th><th>Last Login</th><th>Actions</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },
    
    renderActivity() {
        const el = document.getElementById('admin-panel-activity');
        if (!el) return;
        
        const log = this.getActivity();
        
        if (log.length === 0) {
            el.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No activity recorded yet.</p>
                </div>
            `;
            return;
        }
        
        const iconMap = CONFIG.ADMIN.ACTIVITY_ICON_MAP || {};
        el.innerHTML = `
            <ul class="activity-list">
                ${log.map(entry => `
                    <li class="activity-item">
                        <div class="activity-icon"><i class="fas ${iconMap[entry.event] || 'fa-circle'}"></i></div>
                        <div class="activity-body">
                            <span>${entry.detail}</span>
                            <small>${entry.event} · ${new Date(entry.time).toLocaleString()}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    },
    
    copyCode(code) {
        if (typeof copyToClipboard === 'function') {
            copyToClipboard(code);
        }
    }
};

// Expose globally (inline onclick handlers + navigation)
window.AdminManager = AdminManager;

document.addEventListener('DOMContentLoaded', () => {
    // Tabs are static markup; bind once
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            AdminManager.activeTab = tab.dataset.tab;
            AdminManager.render();
        });
    });
    
    // Refresh panel when auth changes while on the admin page
    document.addEventListener('authChanged', () => {
        if (Navigation.currentPage === 'admin' && AdminManager._bound) {
            AdminManager.render();
        }
    });
});
