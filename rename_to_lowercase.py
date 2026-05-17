#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter nomes de arquivos e referências HTML para minúsculas
Uso: python3 rename_to_lowercase.py
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Diretórios a processar
IMAGES_DIR = "images"
HTML_FILES_PATTERN = "**/*.html"

# Mapa de arquivos a renomear (antigo -> novo)
rename_map = {}
# Mapa de referências HTML a atualizar
reference_map = defaultdict(list)

def normalize_filename(filename):
    """Converte nome do arquivo para minúsculas, mantendo extensão"""
    name, ext = os.path.splitext(filename)
    return name.lower() + ext.lower()

def scan_images():
    """Escaneia pasta images e mapeia arquivos para renomear"""
    print("[1/3] Escaneando pasta 'images'...")
    
    image_path = Path(IMAGES_DIR)
    if not image_path.exists():
        print(f"❌ Pasta '{IMAGES_DIR}' não encontrada!")
        return False
    
    duplicates = defaultdict(list)
    
    for root, dirs, files in os.walk(image_path):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ".")
            normalized = normalize_filename(file)
            
            if file != normalized:
                rename_map[full_path] = (os.path.join(root, normalized), rel_path)
                print(f"  ✓ {file} → {normalized}")
            
            # Detectar duplicatas (mesmo arquivo em casos diferentes)
            normalized_lower = normalized.lower()
            duplicates[normalized_lower].append(full_path)
    
    # Avisar sobre duplicatas
    for norm_name, paths in duplicates.items():
        if len(paths) > 1:
            print(f"\n⚠️  DUPLICATA DETECTADA: {norm_name}")
            for p in paths:
                print(f"    - {p}")
    
    print(f"\n📊 Total de arquivos a renomear: {len(rename_map)}\n")
    return True

def find_html_references():
    """Encontra todas as referências a arquivos da pasta images nos HTMLs"""
    print("[2/3] Procurando referências nos arquivos HTML...")
    
    # Padrões para encontrar referências a arquivos
    patterns = [
        r'src=["\']([^"\']*?images[^"\']*?)["\']',
        r'href=["\']([^"\']*?images[^"\']*?)["\']',
    ]
    
    html_files = list(Path(".").glob(HTML_FILES_PATTERN))
    
    for html_file in html_files:
        if "node_modules" in str(html_file):
            continue
        
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for pattern in patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    ref = match.group(1)
                    # Normalizar o caminho
                    normalized_ref = normalize_path(ref)
                    
                    if ref != normalized_ref:
                        reference_map[str(html_file)].append({
                            'old': ref,
                            'new': normalized_ref,
                            'pattern': pattern
                        })
                        print(f"  ✓ {html_file}: {ref} → {normalized_ref}")
        except Exception as e:
            print(f"  ⚠️  Erro ao ler {html_file}: {e}")
    
    print(f"\n📊 Total de referências a atualizar: {sum(len(v) for v in reference_map.values())}\n")

def normalize_path(path):
    """Normaliza um caminho de arquivo para minúsculas"""
    parts = path.split('/')
    normalized_parts = []
    
    for part in parts:
        if part:
            # Se é um arquivo (tem extensão), normaliza tudo
            if '.' in part:
                name, ext = os.path.splitext(part)
                normalized_parts.append(name.lower() + ext.lower())
            else:
                # Se é uma pasta, também normaliza
                normalized_parts.append(part.lower())
        else:
            normalized_parts.append(part)
    
    return '/'.join(normalized_parts)

def update_html_files():
    """Atualiza referências em arquivos HTML"""
    print("[3/3] Atualizando referências nos HTMLs...")
    
    for html_file, refs in reference_map.items():
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            for ref_info in refs:
                old = ref_info['old']
                new = ref_info['new']
                # Escapar caracteres especiais para regex
                old_escaped = re.escape(old)
                content = re.sub(old_escaped, new, content)
            
            # Salvar apenas se houve mudanças
            if content != original_content:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✓ Atualizado: {html_file}")
        except Exception as e:
            print(f"  ❌ Erro ao atualizar {html_file}: {e}")

def rename_files():
    """Renomeia os arquivos de imagem"""
    print("\n[RENOMEANDO ARQUIVOS]...\n")
    
    errors = []
    for old_path, (new_path, display_path) in rename_map.items():
        try:
            if os.path.exists(old_path):
                os.rename(old_path, new_path)
                print(f"  ✓ {display_path}")
            else:
                errors.append(f"Arquivo não encontrado: {old_path}")
        except Exception as e:
            errors.append(f"Erro ao renomear {old_path}: {e}")
    
    if errors:
        print("\n❌ ERROS durante renomeação:")
        for error in errors:
            print(f"  - {error}")
        return False
    
    print(f"\n✅ {len(rename_map)} arquivos renomeados com sucesso!")
    return True

def main():
    print("=" * 60)
    print("🔄 CONVERSOR DE NOMES PARA MINÚSCULAS")
    print("=" * 60 + "\n")
    
    # Etapa 1: Escanear imagens
    if not scan_images():
        return
    
    # Etapa 2: Encontrar referências HTML
    find_html_references()
    
    # Etapa 3: Pedir confirmação
    if rename_map or reference_map:
        print("\n⚠️  RESUMO DO QUE SERÁ FEITO:")
        print(f"   • Renomear {len(rename_map)} arquivo(s)")
        print(f"   • Atualizar {sum(len(v) for v in reference_map.values())} referência(s) em HTML")
        
        response = input("\n🤔 Deseja continuar? (s/n): ").strip().lower()
        
        if response != 's':
            print("❌ Operação cancelada!")
            return
        
        # Etapa 4: Atualizar HTMLs primeiro (mais seguro)
        update_html_files()
        
        # Etapa 5: Renomear arquivos
        if rename_files():
            print("\n" + "=" * 60)
            print("✅ TUDO CONCLUÍDO COM SUCESSO!")
            print("=" * 60)
    else:
        print("✅ Nenhum arquivo precisa ser renomeado!")

if __name__ == "__main__":
    main()
