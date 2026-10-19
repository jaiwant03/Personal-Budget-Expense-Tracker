import fitz

doc = fitz.open('temp_check.pdf')
print('Num pages:', len(doc))
for i in range(len(doc)):
    p = doc[i]
    images = len(p.get_images())
    text_sample = p.get_text()[:120].strip().replace('\n', ' ')
    print(f'Page {i+1}: images={images} | text="{text_sample}"')
