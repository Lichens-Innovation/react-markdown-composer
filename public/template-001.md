| Info                 | Valeur saisie            |
|----------------------|--------------------------|
| Inspecté par         | **{{formData.text1}}**   |
| Fonction             | **{{formData.select1}}** |
| Date de l'inspection | **{{formData.date1}}**   |
| Météo                | **{{formData.select2}}** |

{{#each sections}}
{{#if (hasType fields "STATUS")}}
<!--keep-->
| {{title}} | Statut | Commentaire |
|-----------|--------|-------------|
{{#each fields~}}
{{#if (eq type "STATUS")}}
| {{title}} | <span style="color:{{
  statusColor
  rawStatus
  @root.statusColors
}}">**{{
  t (concat "configuration.statusOptions." rawStatus)
}}**</span> | {{comment}} |
{{/if~}}
{{/each}}
<!--/keep-->

{{#each fields}}
{{#if (eq type "STATUS")}}
{{#if pictures.length}}
<!--keep-->
**{{title}}** — photos :

{{{markdownImagesTable
  pictures
  @root.printableImages
  columns=3
}}}
<!--/keep-->
{{/if}}
{{/if}}
{{/each}}

{{else if (hasType fields "TEXT_ANSWER")}}
{{#if title}}
### {{title}}
{{/if}}

{{#each fields~}}
{{#if (eq type "TEXT_ANSWER")}}
- {{textAnswer}}
{{/if~}}
{{/each}}

{{else if title}}
### {{title}}
{{/if}}
{{/each}}

### Légende

| Code | Statut                                                    |
|------|-----------------------------------------------------------|
| C    | <span style="color:#43A047">**Conforme**</span>           |
| AR   | <span style="color:#FDD835">**Requiert attention**</span> |
| NC   | <span style="color:#E53935">**Non-conforme**</span>       |
| NI   | <span style="color:#9E9E9E">**Non-inspecté**</span>       |

### Observations
{{#each formData.repeatable2}}
**Endroit :** {{text1}}
**Type :** {{text2}}
**Observations :** {{text3}}

{{{markdownImagesTable
  [media-gallery1]
  @root.printableImages
  columns=3
}}}
---
{{/each}}
