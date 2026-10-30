<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep device defect and received-accessory catalogs in `src/lib/profix.ts` and use `ReceivedAccessories` for intake and detail editing so both screens share device-specific options.
- Store received accessories separately in `service_orders.accessories`; they are customer belongings, not repair parts or stock movements.
- Keep public homepage presentation in `src/routes/index.tsx` and scope its decorative styles to `.profix-home` so redesigns do not change the store management screens.
