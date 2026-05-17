import os
import shutil

# Renomear as pastas
try:
    os.rename(r'c:\site-pasta\images\Logo marcas', r'c:\site-pasta\images\logo-marcas')
    print("✓ Pasta 'Logo marcas' renomeada para 'logo-marcas'")
except Exception as e:
    print(f"✗ Erro ao renomear 'Logo marcas': {e}")

try:
    os.rename(r'c:\site-pasta\images\Logo pagamento', r'c:\site-pasta\images\logo-pagamento')
    print("✓ Pasta 'Logo pagamento' renomeada para 'logo-pagamento'")
except Exception as e:
    print(f"✗ Erro ao renomear 'Logo pagamento': {e}")

# Listar o conteúdo
print("\nPastas em images/:")
for item in sorted(os.listdir(r'c:\site-pasta\images')):
    path = os.path.join(r'c:\site-pasta\images', item)
    if os.path.isdir(path):
        print(f"  [DIR] {item}")
