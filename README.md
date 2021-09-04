# Custom Pickup Points Modal

> A React component that renders VTEX's pickup points modal with custom map markers

## How this works

- Go to `/admin/pickup-points/` and fill the **Additional information** field with an identifier string. For i.e `arcaplanet` (case-sensitive)
- Upload your SVG icons to `CMS -> Layout -> File manager` with the following format: **pup_marker_`identifier`.svg**

### Keep in mind

- The `best markers` are deprecated in this version, only 1 type of marker is needed/used
- If no Additional information is set, the `default` ones will be used
- For best results, the sizes for the icons are as follow: `width="25" height="31"`