import os

def create_file(file_path):
    """Create an empty file at the specified path."""
    with open(file_path, 'w') as f:
        pass

def create_structure():
    """Create the moviestream project folder and file structure."""
    # Root directory
    root_dir = 'moviestream'
    os.makedirs(root_dir, exist_ok=True)

    # Root files
    root_files = [
        '.env.local',
        '.env.example',
        '.gitignore',
        'package.json',
        'package-lock.json',
        'next.config.js',
        'tailwind.config.js',
        'tsconfig.json',
        'components.json',
        'middleware.ts',
        'README.md'
    ]
    for file in root_files:
        create_file(os.path.join(root_dir, file))

    # app/ directory
    app_dir = os.path.join(root_dir, 'app')
    os.makedirs(app_dir, exist_ok=True)

    # app/ root files
    app_files = [
        'globals.css',
        'layout.tsx',
        'page.tsx',
        'loading.tsx',
        'error.tsx',
        'not-found.tsx'
    ]
    for file in app_files:
        create_file(os.path.join(app_dir, file))

    # app/(auth)/
    auth_dir = os.path.join(app_dir, '(auth)')
    os.makedirs(auth_dir, exist_ok=True)
    os.makedirs(os.path.join(auth_dir, 'login'), exist_ok=True)
    create_file(os.path.join(auth_dir, 'login', 'page.tsx'))
    os.makedirs(os.path.join(auth_dir, 'register'), exist_ok=True)
    create_file(os.path.join(auth_dir, 'register', 'page.tsx'))
    create_file(os.path.join(auth_dir, 'layout.tsx'))

    # app/(dashboard)/
    dashboard_dir = os.path.join(app_dir, '(dashboard)')
    os.makedirs(dashboard_dir, exist_ok=True)
    os.makedirs(os.path.join(dashboard_dir, 'dashboard'), exist_ok=True)
    create_file(os.path.join(dashboard_dir, 'dashboard', 'page.tsx'))
    os.makedirs(os.path.join(dashboard_dir, 'dashboard', 'profile'), exist_ok=True)
    create_file(os.path.join(dashboard_dir, 'dashboard', 'profile', 'page.tsx'))
    os.makedirs(os.path.join(dashboard_dir, 'dashboard', 'subscription'), exist_ok=True)
    create_file(os.path.join(dashboard_dir, 'dashboard', 'subscription', 'page.tsx'))
    os.makedirs(os.path.join(dashboard_dir, 'dashboard', 'watchlist'), exist_ok=True)
    create_file(os.path.join(dashboard_dir, 'dashboard', 'watchlist', 'page.tsx'))
    create_file(os.path.join(dashboard_dir, 'layout.tsx'))

    # app/(admin)/
    admin_dir = os.path.join(app_dir, '(admin)')
    os.makedirs(admin_dir, exist_ok=True)
    os.makedirs(os.path.join(admin_dir, 'admin'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'movies'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'movies', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'movies', 'add'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'movies', 'add', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'movies', 'edit', '[id]'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'movies', 'edit', '[id]', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'movies', '[id]'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'movies', '[id]', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'genres'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'genres', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'genres', 'add'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'genres', 'add', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'genres', 'edit', '[id]'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'genres', 'edit', '[id]', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'users'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'users', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'users', '[id]'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'users', '[id]', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'subscriptions'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'subscriptions', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'analytics'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'analytics', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'settings'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'settings', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'settings', 'storage'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'settings', 'storage', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'settings', 'payment'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'settings', 'payment', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'settings', 'tmdb'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'settings', 'tmdb', 'page.tsx'))
    os.makedirs(os.path.join(admin_dir, 'admin', 'settings', 'plans'), exist_ok=True)
    create_file(os.path.join(admin_dir, 'admin', 'settings', 'plans', 'page.tsx'))
    create_file(os.path.join(admin_dir, 'layout.tsx'))

    # app/browse/
    browse_dir = os.path.join(app_dir, 'browse')
    os.makedirs(browse_dir, exist_ok=True)
    create_file(os.path.join(browse_dir, 'page.tsx'))
    os.makedirs(os.path.join(browse_dir, 'genre', '[slug]'), exist_ok=True)
    create_file(os.path.join(browse_dir, 'genre', '[slug]', 'page.tsx'))
    os.makedirs(os.path.join(browse_dir, 'search'), exist_ok=True)
    create_file(os.path.join(browse_dir, 'search', 'page.tsx'))

    # app/movie/
    movie_dir = os.path.join(app_dir, 'movie', '[id]')
    os.makedirs(movie_dir, exist_ok=True)
    create_file(os.path.join(movie_dir, 'page.tsx'))
    os.makedirs(os.path.join(movie_dir, 'watch'), exist_ok=True)
    create_file(os.path.join(movie_dir, 'watch', 'page.tsx'))

    # app/pricing/
    pricing_dir = os.path.join(app_dir, 'pricing')
    os.makedirs(pricing_dir, exist_ok=True)
    create_file(os.path.join(pricing_dir, 'page.tsx'))

    # app/api/
    api_dir = os.path.join(app_dir, 'api')
    os.makedirs(api_dir, exist_ok=True)
    os.makedirs(os.path.join(api_dir, 'auth', '[...nextauth]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'auth', '[...nextauth]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'auth', 'register'), exist_ok=True)
    create_file(os.path.join(api_dir, 'auth', 'register', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'auth', 'profile'), exist_ok=True)
    create_file(os.path.join(api_dir, 'auth', 'profile', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'movies'), exist_ok=True)
    create_file(os.path.join(api_dir, 'movies', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'movies', '[id]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'movies', '[id]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'movies', 'search'), exist_ok=True)
    create_file(os.path.join(api_dir, 'movies', 'search', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'movies', 'stream', '[id]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'movies', 'stream', '[id]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'genres'), exist_ok=True)
    create_file(os.path.join(api_dir, 'genres', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'genres', '[id]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'genres', '[id]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'users'), exist_ok=True)
    create_file(os.path.join(api_dir, 'users', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'users', '[id]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'users', '[id]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'subscriptions'), exist_ok=True)
    create_file(os.path.join(api_dir, 'subscriptions', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'subscriptions', 'plans'), exist_ok=True)
    create_file(os.path.join(api_dir, 'subscriptions', 'plans', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'subscriptions', 'checkout'), exist_ok=True)
    create_file(os.path.join(api_dir, 'subscriptions', 'checkout', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'subscriptions', 'webhook'), exist_ok=True)
    create_file(os.path.join(api_dir, 'subscriptions', 'webhook', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'subscriptions', 'cancel'), exist_ok=True)
    create_file(os.path.join(api_dir, 'subscriptions', 'cancel', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'settings'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'settings', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'settings', 'storage'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'settings', 'storage', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'settings', 'tmdb'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'settings', 'tmdb', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'settings', 'stripe'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'settings', 'stripe', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'analytics'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'analytics', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'admin', 'stats'), exist_ok=True)
    create_file(os.path.join(api_dir, 'admin', 'stats', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'upload', 'video'), exist_ok=True)
    create_file(os.path.join(api_dir, 'upload', 'video', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'upload', 'image'), exist_ok=True)
    create_file(os.path.join(api_dir, 'upload', 'image', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'upload', 'subtitle'), exist_ok=True)
    create_file(os.path.join(api_dir, 'upload', 'subtitle', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'tmdb', 'search'), exist_ok=True)
    create_file(os.path.join(api_dir, 'tmdb', 'search', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'tmdb', 'movie', '[id]'), exist_ok=True)
    create_file(os.path.join(api_dir, 'tmdb', 'movie', '[id]', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'tmdb', 'import'), exist_ok=True)
    create_file(os.path.join(api_dir, 'tmdb', 'import', 'route.ts'))
    os.makedirs(os.path.join(api_dir, 'health'), exist_ok=True)
    create_file(os.path.join(api_dir, 'health', 'route.ts'))

    # app/webhooks/
    webhooks_dir = os.path.join(app_dir, 'webhooks', 'stripe')
    os.makedirs(webhooks_dir, exist_ok=True)
    create_file(os.path.join(webhooks_dir, 'route.ts'))

    # components/
    components_dir = os.path.join(root_dir, 'components')
    os.makedirs(components_dir, exist_ok=True)
    ui_dir = os.path.join(components_dir, 'ui')
    os.makedirs(ui_dir, exist_ok=True)
    ui_files = [
        'button.tsx',
        'input.tsx',
        'card.tsx',
        'dialog.tsx',
        'dropdown-menu.tsx',
        'form.tsx',
        'label.tsx',
        'select.tsx',
        'table.tsx',
        'tabs.tsx',
        'toast.tsx',
        'toaster.tsx',
        'use-toast.tsx',
        'badge.tsx',
        'avatar.tsx',
        'progress.tsx',
        'slider.tsx',
        'switch.tsx',
        'textarea.tsx',
        'alert.tsx',
        'alert-dialog.tsx',
        'sheet.tsx',
        'skeleton.tsx',
        'popover.tsx'
    ]
    for file in ui_files:
        create_file(os.path.join(ui_dir, file))

    layout_dir = os.path.join(components_dir, 'layout')
    os.makedirs(layout_dir, exist_ok=True)
    layout_files = [
        'header.tsx',
        'footer.tsx',
        'sidebar.tsx',
        'navbar.tsx',
        'mobile-menu.tsx'
    ]
    for file in layout_files:
        create_file(os.path.join(layout_dir, file))

    auth_comp_dir = os.path.join(components_dir, 'auth')
    os.makedirs(auth_comp_dir, exist_ok=True)
    auth_files = [
        'login-form.tsx',
        'register-form.tsx',
        'oauth-buttons.tsx',
        'auth-guard.tsx',
        'user-menu.tsx'
    ]
    for file in auth_files:
        create_file(os.path.join(auth_comp_dir, file))

    movie_comp_dir = os.path.join(components_dir, 'movie')
    os.makedirs(movie_comp_dir, exist_ok=True)
    movie_files = [
        'movie-card.tsx',
        'movie-grid.tsx',
        'movie-hero.tsx',
        'movie-player.tsx',
        'movie-details.tsx',
        'movie-form.tsx',
        'genre-filter.tsx',
        'search-bar.tsx',
        'trailer-modal.tsx',
        'subtitle-selector.tsx'
    ]
    for file in movie_files:
        create_file(os.path.join(movie_comp_dir, file))

    admin_comp_dir = os.path.join(components_dir, 'admin')
    os.makedirs(admin_comp_dir, exist_ok=True)
    admin_files = [
        'dashboard-stats.tsx',
        'admin-header.tsx',
        'data-table.tsx',
        'upload-manager.tsx',
        's3-settings.tsx',
        'stripe-settings.tsx',
        'tmdb-settings.tsx',
        'plan-manager.tsx',
        'analytics-charts.tsx'
    ]
    for file in admin_files:
        create_file(os.path.join(admin_comp_dir, file))

    subscription_comp_dir = os.path.join(components_dir, 'subscription')
    os.makedirs(subscription_comp_dir, exist_ok=True)
    subscription_files = [
        'pricing-card.tsx',
        'subscription-status.tsx',
        'payment-form.tsx',
        'billing-history.tsx'
    ]
    for file in subscription_files:
        create_file(os.path.join(subscription_comp_dir, file))

    common_comp_dir = os.path.join(components_dir, 'common')
    os.makedirs(common_comp_dir, exist_ok=True)
    common_files = [
        'loading-spinner.tsx',
        'error-boundary.tsx',
        'confirmation-dialog.tsx',
        'image-upload.tsx',
        'video-upload.tsx',
        'pagination.tsx',
        'breadcrumb.tsx'
    ]
    for file in common_files:
        create_file(os.path.join(common_comp_dir, file))

    # lib/
    lib_dir = os.path.join(root_dir, 'lib')
    os.makedirs(lib_dir, exist_ok=True)
    lib_files = [
        'auth.ts',
        'db.ts',
        's3.ts',
        'stripe.ts',
        'tmdb.ts',
        'utils.ts',
        'validations.ts',
        'constants.ts',
        'email.ts',
        'cache.ts'
    ]
    for file in lib_files:
        create_file(os.path.join(lib_dir, file))

    # models/
    models_dir = os.path.join(root_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    models_files = [
        'User.ts',
        'Movie.ts',
        'Genre.ts',
        'Subscription.ts',
        'Settings.ts',
        'WatchHistory.ts',
        'Subtitle.ts'
    ]
    for file in models_files:
        create_file(os.path.join(models_dir, file))

    # types/
    types_dir = os.path.join(root_dir, 'types')
    os.makedirs(types_dir, exist_ok=True)
    types_files = [
        'auth.ts',
        'movie.ts',
        'user.ts',
        'subscription.ts',
        'admin.ts',
        'api.ts',
        'index.ts'
    ]
    for file in types_files:
        create_file(os.path.join(types_dir, file))

    # hooks/
    hooks_dir = os.path.join(root_dir, 'hooks')
    os.makedirs(hooks_dir, exist_ok=True)
    hooks_files = [
        'use-auth.ts',
        'use-movies.ts',
        'use-subscription.ts',
        'use-upload.ts',
        'use-admin.ts',
        'use-search.ts',
        'use-local-storage.ts'
    ]
    for file in hooks_files:
        create_file(os.path.join(hooks_dir, file))

    # contexts/
    contexts_dir = os.path.join(root_dir, 'contexts')
    os.makedirs(contexts_dir, exist_ok=True)
    contexts_files = [
        'auth-context.tsx',
        'theme-context.tsx',
        'admin-context.tsx',
        'subscription-context.tsx'
    ]
    for file in contexts_files:
        create_file(os.path.join(contexts_dir, file))

    # utils/
    utils_dir = os.path.join(root_dir, 'utils')
    os.makedirs(utils_dir, exist_ok=True)
    utils_files = [
        'format.ts',
        'validation.ts',
        'encryption.ts',
        'file-upload.ts',
        'video-processing.ts',
        'error-handling.ts'
    ]
    for file in utils_files:
        create_file(os.path.join(utils_dir, file))

    # config/
    config_dir = os.path.join(root_dir, 'config')
    os.makedirs(config_dir, exist_ok=True)
    config_files = [
        'database.ts',
        'storage.ts',
        'auth.ts',
        'api.ts'
    ]
    for file in config_files:
        create_file(os.path.join(config_dir, file))

    # middleware/
    middleware_dir = os.path.join(root_dir, 'middleware')
    os.makedirs(middleware_dir, exist_ok=True)
    middleware_files = [
        'auth-middleware.ts',
        'admin-middleware.ts',
        'subscription-middleware.ts',
        'rate-limit-middleware.ts'
    ]
    for file in middleware_files:
        create_file(os.path.join(middleware_dir, file))

    # scripts/
    scripts_dir = os.path.join(root_dir, 'scripts')
    os.makedirs(scripts_dir, exist_ok=True)
    scripts_files = [
        'seed-db.ts',
        'migrate-db.ts',
        'setup-admin.ts'
    ]
    for file in scripts_files:
        create_file(os.path.join(scripts_dir, file))

    # styles/
    styles_dir = os.path.join(root_dir, 'styles')
    os.makedirs(styles_dir, exist_ok=True)
    styles_files = [
        'components.css',
        'video-player.css',
        'admin.css'
    ]
    for file in styles_files:
        create_file(os.path.join(styles_dir, file))

    # public/
    public_dir = os.path.join(root_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(os.path.join(public_dir, 'images', 'icons'), exist_ok=True)
    public_files = [
        os.path.join('images', 'logo.png'),
        os.path.join('images', 'placeholder-movie.jpg'),
        os.path.join('images', 'hero-bg.jpg'),
        os.path.join('videos', 'trailer-placeholder.mp4'),
        'favicon.ico'
    ]
    for file in public_files:
        create_file(os.path.join(public_dir, file))

    # docs/
    docs_dir = os.path.join(root_dir, 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    docs_files = [
        'api.md',
        'setup.md',
        'deployment.md',
        'features.md'
    ]
    for file in docs_files:
        create_file(os.path.join(docs_dir, file))

    # tests/
    tests_dir = os.path.join(root_dir, 'tests')
    os.makedirs(tests_dir, exist_ok=True)
    os.makedirs(os.path.join(tests_dir, '__mocks__'), exist_ok=True)
    os.makedirs(os.path.join(tests_dir, 'api'), exist_ok=True)
    os.makedirs(os.path.join(tests_dir, 'components'), exist_ok=True)
    os.makedirs(os.path.join(tests_dir, 'pages'), exist_ok=True)
    os.makedirs(os.path.join(tests_dir, 'utils'), exist_ok=True)
    create_file(os.path.join(tests_dir, 'setup.ts'))

    print(f"Project structure created successfully in '{root_dir}' directory.")

if __name__ == '__main__':
    create_structure()