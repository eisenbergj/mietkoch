from pathlib import Path
import re

root = Path(__file__).resolve().parent


def build_page(template_name: str, output_path: Path, shell_path: Path, panel_definitions: list[tuple[str, Path]]):
    template_path = root / template_name
    template_content = template_path.read_text(encoding='utf-8')
    shell = shell_path.read_text(encoding='utf-8')

    for panel_id, panel_path in panel_definitions:
        marker = f'<section id="{panel_id}" class="panel" aria-labelledby="tab-{panel_id.split("-", 1)[1]}"></section>'
        panel_content = panel_path.read_text(encoding='utf-8')
        shell = shell.replace(marker, panel_content)

    assembled = template_content.replace('<div id="page-shell"></div>', shell)

    output_path.write_text(assembled, encoding='utf-8')
    print(f'Built {output_path.name} from partials')


build_page(
    'index.template.html',
    root / 'index.html',
    root / 'partials' / 'page-shell.html',
    [
        ('panel-team', root / 'partials' / 'panels' / 'workshop.html'),
        ('panel-catering', root / 'partials' / 'panels' / 'catering.html'),
        ('panel-recipes', root / 'partials' / 'panels' / 'recipes.html'),
        ('panel-about-us', root / 'partials' / 'panels' / 'about.html'),
    ],
)

build_page(
    'index_en.template.html',
    root / 'index_en.html',
    root / 'partials' / 'en' / 'page-shell.html',
    [
        ('panel-team', root / 'partials' / 'en' / 'panels' / 'workshop.html'),
        ('panel-catering', root / 'partials' / 'en' / 'panels' / 'catering.html'),
        ('panel-recipes', root / 'partials' / 'en' / 'panels' / 'recipes.html'),
        ('panel-about-us', root / 'partials' / 'en' / 'panels' / 'about.html'),
    ],
)
